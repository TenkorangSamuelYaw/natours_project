import express from 'express';
import {
  getAllUsers,
  updateMe,
  deleteMe, 
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import {
  signUp,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe); // When the user deletes his account, it is removed but made inactive

router.route('/').get(getAllUsers).post(); //Nothing to run in the post request for now

router
  .route('/:id')
  .get(getUser)
  .patch(protect, updateUser)
  .delete(protect, restrictTo('admin'), deleteUser); // Only admins can permanently remove users

export default router; // ES 6 approach
// module.exports = router; Common JS approach
