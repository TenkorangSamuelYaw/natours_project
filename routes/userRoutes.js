import express from 'express';
import {
  getAllUsers,
  updateMe,
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
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router; // ES 6 approach
// module.exports = router; Common JS approach
