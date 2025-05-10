import { Review } from './../models/reviewModels.js';
import { createOne, deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

export const setTourAndUserIds = (req, res, next) => {
  // If there's no user id specified in the body of the request, get it from the current logged in user
  if (!req.body.user) req.body.user = req.user.id;
  // If there's no tour id specified in the body, get it from req.params
  if (!req.body.tour) req.body.tour = req.params.tourId; // merge paramters functionality works here
  next();
}

export const getAllReviews = getAll(Review);

export const getReview = getOne(Review);

export const createReview = createOne(Review);

export const updateReview = updateOne(Review);

export const deleteReview = deleteOne(Review);

// NOTE goal is to access the reviews on tours, when no user id, tour id is specified