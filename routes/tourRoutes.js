import express from 'express';
import {getMonthlyPlan, getTourStats, aliasTopTours ,getTours, getTour, getToursWithin, createTour, updateTour, deleteTour, getDistances, getNearbyToursWithDistance } from '../controllers/tourController.js';
import { protect, restrictTo } from './../controllers/authController.js';
import reviewRouter from './../routes/reviewRoutes.js'


const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

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
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

router.route('/distances/center/:latlng/unit/:unit').get(getDistances);

router
  .route('/tours-nearby/:distance/center/:latlng/unit/:unit')
  .get(getNearbyToursWithDistance);

router
.route('/')
.get(getTours)
.post(protect, restrictTo('admin', 'lead-guide'), createTour); // Only admins and lead guides can create new tours

router
.route('/:id')
.get(getTour)
.patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router; 