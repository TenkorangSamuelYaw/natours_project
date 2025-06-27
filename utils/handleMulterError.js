import AppError from '../utils/appError.js';
import multer from 'multer';

export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return next(new AppError('File too large. Maximum size is 5MB.', 400));
  }
  if (error.message === 'Only image files are allowed!') {
    return next(new AppError('Only image files are allowed.', 400));
  }
  next(error);
};
