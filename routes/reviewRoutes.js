import express from 'express';
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setTourAndUserIds
} from './../controllers/reviewController.js';

import { restrictTo, protect } from './../controllers/authController.js';

const router = express.Router({mergeParams: true}); 

// You must be logged in to perform any of the actions below
router.use(protect)
router
  .route('/')
  .get(getAllReviews) // Must users be logged in before they get access to reviews???
  .post(restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default router;
