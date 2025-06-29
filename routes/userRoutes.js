import express from 'express';
import {
  getAllUsers,
  updateMe,
  deleteMe, 
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe
} from '../controllers/userController.js';
import {
  signUp,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} from '../controllers/authController.js';

import { uploadUserPhoto } from '../controllers/fileUploadController.js';
import { handleMulterError } from '../utils/handleMulterError.js';

const router = express.Router();

// You don't need to be logged in to perform any of the actions below
router.post('/signup', router.post('/signup', uploadUserPhoto, handleMulterError, signUp));
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);


// You need to be logged in to perform any of the actions below
router.use(protect);
router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe); // When the user deletes his account, it is not removed but made inactive

// Only admins can perform the actions below
router.use(restrictTo('admin'))
router.route('/').get(getAllUsers).post(createUser); // In future see how when someone is on this endpoint, the person will be redirected to /signUp

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo('admin'), deleteUser); // Only admins can permanently remove users

export default router; // ES 6 approach
// module.exports = router; Common JS approach
