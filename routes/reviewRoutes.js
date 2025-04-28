import express from 'express';
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from './../controllers/reviewController.js';

import { restrictTo, protect } from './../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllReviews) // Must users be logged in before they get access to reviews???
  .post(protect, restrictTo('user'), createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(protect, restrictTo('user'), updateReview)
  .delete(protect, restrictTo('user'), deleteReview);

export default router;
