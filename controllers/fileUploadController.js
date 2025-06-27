import multer from 'multer';
import path from 'path';
import AppError from '../utils/appError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/img/users/'),
  filename: (req, file, cb) =>
    cb(null, 'temp-' + Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new AppError('Only image files are allowed!', 400), false);
};

export const uploadUserPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');
