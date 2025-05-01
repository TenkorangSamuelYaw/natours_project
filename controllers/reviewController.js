import AppError from './../utils/appError.js';
import { Review } from './../models/reviewModels.js';
import catchAsyncError from './../utils/catchAsync.js';

export const getAllReviews = catchAsyncError(async (req, res, next) => {
    const reviews = await Review.find();
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews: reviews
        }
    });
});

export const getReview = catchAsyncError(async (req, res, next) => {
    let reviewId = req.params.id;
    if(!req.params.id) reviewId = req.params.reviewId;
    const review = await Review.findById(reviewId);
    if(!review) {
        return next(new AppError(`No review found with the ID: ${reviewId}`, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review: review
        }
    });
});

export const createReview = catchAsyncError(async (req, res, next) => {
    let {review, tour, user, rating} = req.body;
    // NOTE Nested routes implementation
    // If there's no user id specified in the body of the request, get it from the current logged in user
    if(!user) user = req.user.id;
    // If there's no tour id specified in the body, get it from req.params
    if(!tour) tour = req.params.tourId; // merge paramters functionality works here
    const newReview = await Review.create({ review, tour, user, rating}); // Remember to pass a destructured object instead of req.body
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

export const updateReview = catchAsyncError(async (req, res, next) => {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!updatedReview) {
      return next(new AppError(`No review found with the ID: ${req.user.id}`));
    }
    res.status(200).json({
      status: 'success',
      data: {
        updatedReview: updatedReview,
      },
    });
});

export const deleteReview = catchAsyncError(async (req, res, next) => {
  const deletedReview = await Review.findByIdAndDelete(req.params.id);
  if (!deletedReview) {
    return next(
      new AppError(`No review found with the ID: ${req.params.id}`, 404),
    );
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// NOTE goal is to access the reviews on tours, when no user id, tour id is specified