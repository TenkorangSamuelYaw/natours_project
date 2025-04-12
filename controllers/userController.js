import AppError from '../utils/appError.js';
import {User} from './../models/userModel.js';
import catchAsyncError from './../utils/catchAsync.js';


export const getAllUsers = catchAsyncError(async(req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users
    }
  });
});
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

export const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

export const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

export const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
