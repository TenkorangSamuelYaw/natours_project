import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { type } from 'os';

// TODO Think of signing users in in the future using their usernames, for now I'm using their emails
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!, Won't work on updating users password
      validator: function (el) {
        return el === this.password; // el represents current confirmPassword
      },
      message: "Passwords don't match",
    },
  },
  photo: String,
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// NOTE Password encryption implemented below
userSchema.pre('save', async function (next) {
  // this points to current query, because this is a document middleware
  // Check if password is newly created(???) or been modified, then only you encrypt it
  if (!this.isModified('password')) {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined; // Not needed in the database after validation
    next();
  }
});

userSchema.pre('save', function (next) {
  // 1. Check if the password has been modified
  // 2. Or the document is new
  if (!this.isModified('password') || this.isNew) return next();
  // 3. IF the above check fails, the password has been modified
  console.log("Password modified");
  this.passwordChangedAt = Date.now() - 1000; // Address latency issues (this will compensate for the time it will take to finish the db operation)
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to current query because this is a query middleware
  this.find({active: {$ne: false}}); // Use != false because some of the documents were created before the active property was added
  next();
})

// Instance method, read more
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // return true if passwords are the same, otherwise false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  // First check if the passwordChangedAt property exist on the current document, since not all users have this property set
  if (this.passwordChangedAt) {
    // 1. Convert the date format of the passwordChangedAt property to milliseconds date format
    const changedTimestamp = parseInt(this.passwordChangedAt / 1000, 10);
    // 2. Compare the jwttimestamp with the changedtimestamp to see if the password was changed after the token was issued
    // A. If the jwttimestamp is 300ms and the changedtimestamp is 500ms, that means the user changed the password after the token was issued, such a token should no longer exist
    return JWTTimestamp < changedTimestamp; // 300 < 500 means password was changed
  }

  return false; // By default return false, meaning the password hasn't changed since the token was issued (JWTTimestamp > changedTimestamp)
};

//NOTE Instant method for creating passowrd reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // encrypted reset token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken; // unencrypted reset token
};
export const User = mongoose.model('User', userSchema);
