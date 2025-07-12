import path from 'path';
import fs from 'fs/promises';
import { filterObject } from '../utils/filterObject.js';
import { renameUploadedFile } from '../utils/fileUtils.js';
import AppError from '../utils/appError.js';
import { User } from './../models/userModel.js';
import catchAsyncError from './../utils/catchAsync.js';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

// Middleware to pass the currently logged in users id as a req param
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// NOTE User data updated here, user password updated in the authController
export const updateMe = catchAsyncError(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. Use /updateMyPassword.',
        400,
      ),
    );
  }

  // Handle uploaded file
  if (req.file) {
    const ext = path.extname(req.file.originalname);
    let photoName;

    if (req.user.photo) {
      photoName = req.user.photo;
    } else {
      photoName = `user-${req.user.id}-${Date.now()}${ext}`;
    }

    await renameUploadedFile(req.file.path, photoName);

    // Delete old photo if a new name is generated
    if (req.user.photo && photoName !== req.user.photo) {
      const oldPath = path.join('public/img/users', req.user.photo);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.warn(`⚠️ Failed to delete old photo: ${err.message}`);
      }
    }

    req.body.photo = photoName;
  }

  // Only allow name, email, photo fields to be updated
  const filteredBody = filterObject(req.body, 'name', 'email', 'photo');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsyncError(async (req, res, next) => {
  // We don't necessarily delete the user, we set the active property to false(this way, they can reactivate their account)
  await User.findByIdAndUpdate(req.user.id, { active: false });
  // Because the active is set to fault, make sure all the query returns doesn't include the documents with active = false
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
