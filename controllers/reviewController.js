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
    const review = await Review.findById(req.params.id);
    if(!review) {
        return next(new AppError(`No review found with the ID: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review: review
        }
    });
});

export const createReview = catchAsyncError(async (req, res, next) => {
    const {review, tour, user, rating} = req.body;
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