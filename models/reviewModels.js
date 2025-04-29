import mongoose from 'mongoose';
import path from 'path';

const schemaOptions = {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
      return ret;
    },
  },
  toObject: { virtuals: true },
};

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // Establishing Many : 1 between reviews and tour
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    // Establishing Many : 1 between reviews and user
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  schemaOptions,
);

// Query middleware for populating tour and user data into each review
reviewSchema.pre(/^find/, function (next) {
  const tourSelectOptions = {
    // __v: 0,
    // createdAt: 0,
    // passwordChangedAt: 0
    name: 1
  };

  const userSelectOptions = {
    // __v: 0,
    // createdAt: 0,
    // passwordChangedAt: 0
    name: 1,
    photo: 1
  };
//   this.populate({
//     path: 'tour',
//     select: tourSelectOptions,
//   }).populate({
//     path: 'user',
//     select: userSelectOptions
//   });
  this.populate({
    path: 'user',
    select: userSelectOptions
  });
  next();
});

// Create and export a model called Review
export const Review = mongoose.model('Review', reviewSchema);
