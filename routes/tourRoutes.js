import express from 'express';
import {getMonthlyPlan, getTourStats, aliasTopTours ,getTours, getTour, createTour, updateTour, deleteTour } from '../controllers/tourController.js';
import { protect, restrictTo } from './../controllers/authController.js';
import reviewRouter from './../routes/reviewRoutes.js'


const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/reviews/:reviewId', reviewRouter);

// router.param('id', checkID); // Anytime the tours endpoint is hit, this middleware checks if the ID is valid

// The route below implements top 5 best and cheapest tours
// Uses the same logic in the getTours method, but has a middleware fn for prefilling.
router
.route('/top-5-cheap')
.get(aliasTopTours, getTours);

router
.route('/tour-stats')
.get(getTourStats);

router
.route('/monthly-plan/:year')
.get(getMonthlyPlan);

router
.route('/')
.get(protect, getTours)
.post(createTour);

router
.route('/:id')
.get(getTour)
.patch(updateTour)
.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router; 