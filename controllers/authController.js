import { promisify } from 'util';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import catchAsyncError from './../utils/catchAsync.js';
import { User } from './../models/userModel.js';
import AppError from './../utils/appError.js';
import sendEmail from './../utils/email.js';
import { renameUploadedFile } from '../utils/fileUtils.js';

const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'TOUR_ADMIN_2024';

const signToken = (id) => {
  return jsonwebtoken.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const { password, ...userData } = user.toObject(); // Exclude the password from the response
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: userData,
    },
  });
};

export const signUp = catchAsyncError(async (req, res, next) => {
  const { name, email, password, confirmPassword, role, secretCode } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return next(new AppError('All required fields must be filled', 400));

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already registered', 400));

  const allowedRoles = ['user', 'guide', 'lead-guide', 'admin'];
  if (role && !allowedRoles.includes(role))
    return next(new AppError('Invalid role selected', 400));

  if (role === 'admin' && secretCode !== ADMIN_SECRET_CODE)
    return next(new AppError('Invalid admin secret code', 403));

  let photoName = null;
  if (req.file) {
    try {
      const nextPhotoNumber = await User.getNextPhotoNumber();
      photoName = `user-${nextPhotoNumber}.jpg`;
      await renameUploadedFile(req.file.path, photoName);
    } catch (err) {
      photoName = req.file.filename;
    }
  }

  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role: role || 'user',
    photo: photoName,
  });

  if (role === 'admin') {
    console.log(`🚨 ADMIN CREATED: ${email} at ${new Date().toISOString()}`);
  }
  createAndSendToken(newUser, 201, res);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. Check if email and password were actually sent by the client
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exist and password is actually correct
  const user = await User.findOne({ email: email }).select('+password'); // Explicitly select the password
  // If there's no user or the password is incorrect
  if (!user || !(await user.correctPassword(password, user.password))) {
    // If you implement it this way, you prevent an attacker from knowing which is wrong, betwwen the email and password
    // But is it a good user experience?
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If everything is okay, send token to the client
  createAndSendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({status: 'success'});
}

export const protect = catchAsyncError(async (req, res, next) => {
  // 1. Check if the token exist in the req
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401),
    );
  }
  // 2. Verify token
  const decoded = await promisify(jsonwebtoken.verify)(
    token,
    process.env.JWT_SECRET,
  );
  console.log(decoded);

  // 3. Check if user accessing the route exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist.', 401),
    );
  }

  // 4. Check if user changed password after token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const isLoggedIn = async (req, res, next) => {
  // 1. Check if the token exist in the req
  if (req.cookies.jwt) {
    try {
      // 1. Verify token
      const decoded = await promisify(jsonwebtoken.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2. Check if user accessing the route exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3. Check if user changed password after token was issued
      if (currentUser.passwordChangedAfter(decoded.iat)) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
    
  }
  // If there is no cookie, call next immediately
  next();
};

export const restrictTo = (...roles) => {
  // 1. roles is an array of the arguments passed to it
  // 2. Check if the current user's role exist in the roles array
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(roles);
      console.log(req.user.role);
      return next(
        new AppError("You're not allowed to perform this operation", 403),
      );
    }
    // GRANT ACCESS TO THE ROUTE
    next();
  };
};

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with ${req.body.email} address`, 404),
    );
  }
  // 2. Generate random token if the user was found
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Save the current document because of the new field added to it
  // 3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token valid for 10 mins',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later',
        500,
      ),
    );
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  // 1. Get user based on token, and the passwordResetExpires property (check if the passwordResetExpires is greater than now, which means it's in the future and hasn't expired)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2. If user exist, and token has not expired, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3. Update the changedPasswordAt property for this user
  // 4. Log user in
  createAndSendToken(user, 200, res);
});

// NOTE This route controller handles passwordChange for an already logged in user. An already logged in user has an id
// NOTE The id can be gotten from the protect route (req.user)
export const updatePassword = catchAsyncError(async (req, res, next) => {
  // 1. Get the user from the collection
  const user = await User.findById(req.user.id).select('+password'); // I have to add the password field because it's not included in the query by default
  // 2. Call the correctPassword instant method to verify the user's current password
  if (!user.correctPassword(req.body.currentPassword, user.password)) {
    return next(
      new AppError('Your current password is invalid. Try again', 401),
    );
  }
  // 3. If password is correct, update the password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();
  // 4. Log user in, send JWT
  createAndSendToken(user, 200, res);
});
