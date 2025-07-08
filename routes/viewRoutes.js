import express from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
  getAccount,
} from './../controllers/viewsController.js';

import { isLoggedIn, protect } from './../controllers/authController.js';

const router = express.Router();

router.route('/').get(isLoggedIn, getOverview);
router.route('/tour/:slug').get(isLoggedIn, getTour);
router.route('/login').get(isLoggedIn, getLoginForm);
router.route('/signup').get(isLoggedIn, getSignUpForm);
router.route('/me').get(protect, getAccount);


export default router;