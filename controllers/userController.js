import AppError from '../utils/appError.js';
import {User} from './../models/userModel.js';
import catchAsyncError from './../utils/catchAsync.js';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

// Middleware to pass the currently logged in users id as a req param
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

// NOTE User data updated here, user password updated in the authController
export const updateMe = catchAsyncError(async (req, res, next) => {
  // 1. Check and create error if user tried to update password
  if (req.body.password || req.body.confirmPassword) {
    next(new AppError('This route is not for paasword update. Please use /updateMyPassword', 400));
  }

  // 2. If not update user document
  // NOTE Can't use user.save() here because some fields like password are required and we're not updating those fields
  const {name, email} = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true },
  );
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
});

export const deleteMe = catchAsyncError(async (req, res, next) => {
  // We don't necessarily delete the user, we set the active property to false(this way, they can reactivate their account)
  await User.findByIdAndUpdate(req.user.id, {active: false});
  // Because the active is set to fault, make sure all the query returns doesn't include the documents with active = false
  res.status(204).json({
    status: 'success',
    data: null
  });
})



// NOTE Implemented in the authentication handler
export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: "Use '/signUp' to create a new user",
  });
};
export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User);
// NOTE Admin is the one in charge of this route
export const deleteUser = deleteOne(User);
