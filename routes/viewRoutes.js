import express from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
} from './../controllers/viewsController.js';

import { isLoggedIn } from './../controllers/authController.js';

const router = express.Router();

router.use(isLoggedIn); // Use this middleware to see if the user is logged in or not(protect is primarily for protected routes)

router.route('/').get(getOverview);
router.route('/tour/:slug').get(getTour);
router.route('/login').get(getLoginForm);
router.route('/signup').get(getSignUpForm);


export default router;