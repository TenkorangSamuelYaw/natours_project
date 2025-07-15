import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import AppError from '../utils/appError.js';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'public/img/users/'),
//   filename: (req, file, cb) =>
//     cb(null, 'temp-' + Date.now() + path.extname(file.originalname)),
// });

// Use RAM to temporarily hold the uploaded images
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new AppError('Only image files are allowed!', 400), false);
};

export const uploadUserPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');


// Middleware to resize uploaded images
export const resizeUploadedPhoto = async (req, res, next) => {
  if (!req.file) return next();

  // Handle photo naming
  const userId = req.user?.id || 'temp'; // use temp name if user doesn't exist yet
  const timestamp = Date.now();
  const fileName = `user-${userId}-${timestamp}.jpeg`;
  const filePath = path.join('public/img/users', fileName);

  try {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(filePath);

    req.body.photo = fileName;

    // Delete old photo only if user exists (updateMe route)
    if (req.user && req.user.photo && req.user.photo !== 'default.jpg') {
      const oldPath = path.join('public/img/users', req.user.photo);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.warn(`⚠️ Failed to delete old photo: ${err.message}`);
      }
    }

    next();
  } catch (err) {
    return next(new AppError('Error processing image', 500));
  }
};
