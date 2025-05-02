import AppError from './../utils/appError.js';
import { Review } from './../models/reviewModels.js';
import catchAsyncError from './../utils/catchAsync.js';
import { deleteOne, updateOne } from './handlerFactory.js';

export const getAllReviews = catchAsyncError(async (req, res, next) => {
    let filter = {}
    if(req.params.tourId) filter = { tour: req.params.tourId };
    // The two lines above help to get all the reviews on a particular tour
    const reviews = await Review.find(filter); // Where as an empty filter returns all the reviews void of a tour
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

export const updateReview = updateOne(Review);

export const deleteReview = deleteOne(Review);

// NOTE goal is to access the reviews on tours, when no user id, tour id is specified