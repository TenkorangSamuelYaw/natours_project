import mongoose from 'mongoose';
import path from 'path';
import { Tour } from './tourModels.js';

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

/* 
  // This section creates a static method on the model
  // 2. It will receive the current tours id and update:
  // 2. The total number of ratings on each tour
  // 3. The average number of ratings on each tour
 */
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // In static methods, this points to the current model
  const stats =  await this.aggregate([
    // 1. Match all the reviews that belong to the current tour
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: '$tour', // Group all the reviews by the tour
        nRating: {$sum : 1}, // Add 1 to each review that was matched in the first step
        avgRating: {$avg : '$rating'} // Pick the rating from the 'rating field' of each review that was matched and find the avg for all using $avg
      }
    }
  ]);
  // console.log(stats);
  // Persist the stats data into the Tours database
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
}

// Use this middleware to get the stats after a new review doc is created
reviewSchema.post('save', function() {
  // this points to the current document (this.tour) refers to the tour field, which is a MongoDB ID
  this.constructor.calcAverageRatings(this.tour); // I can't say Review.calcAverageRatings because Review model is not created at this point, hence this.constructor
});

// Use this middleware to get the stats after a tour is deleted or updated
// findByIdAndUpdate and findByIdAndDelete uses findOneAnd behind the scences, hence the regex findOneAnd
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // this points to the current query, whether findByIdAndUpdate or findByIdAndDelete and not the current document
  const filter = this.getFilter();
  // Optional: Add a safeguard if no filter is found
  if (!filter || Object.keys(filter).length === 0) return next();
  this.reviewDocument = await this.model.findOne(filter).select(); // This query helps me to get access to the current review document
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
 await this.reviewDocument.constructor.calcAverageRatings(this.reviewDocument.tour);
  
});

// Create and export a model called Review
export const Review = mongoose.model('Review', reviewSchema);
