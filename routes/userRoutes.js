import express from 'express';
import {
  getAllUsers,
  updateMe,
  deleteMe, 
  getUser,
  createUser,
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

router.route('/').get(getAllUsers).post(createUser); // In future see how when someone is on this endpoint, the person will be redirected to /signUp

router
  .route('/:id')
  .get(getUser)
  .patch(protect, updateUser)
  .delete(protect, restrictTo('admin'), deleteUser); // Only admins can permanently remove users

export default router; // ES 6 approach
// module.exports = router; Common JS approach
