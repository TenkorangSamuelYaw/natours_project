import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import AppError from '../utils/appError.js';
import catchAsyncError from './../utils/catchAsync.js';
import { Tour } from './../models/tourModels.js';
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


// Middleware to handle uploaded tour images
export const uploadTourImages = multer({
  storage,
  fileFilter,
}).fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// I used .fields above because I've two fields that accept multiple data 
// If I was to upload the images field alone then I would have done .array('images', 3)

// Middleware to resize uploaded images
export const resizeUploadedPhoto = catchAsyncError(async (req, res, next) => {
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
});

export const attachTour = catchAsyncError(async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return next(new AppError('Tour not found', 404));
    req.tour = tour; // Attach it to req
    next();
  } catch (err) {
    next(err);
  }
});

export const resizeTourPhotos = catchAsyncError(async (req, res, next) => {
  if (!req.files || (!req.files.images && !req.files.imageCover)) return next();

  const timestamp = Date.now();
  const tourId = req.params?.id || 'temp';

  req.body.images = [];

  // 🟢 Handle imageCover
  if (req.files.imageCover && req.files.imageCover[0]) {
    const coverFile = req.files.imageCover[0];
    const coverFileName = `tour-${tourId}-${timestamp}-cover.jpeg`;
    const coverFilePath = path.join('public/img/tours', coverFileName);

    try {
      await sharp(coverFile.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(coverFilePath);

      req.body.imageCover = coverFileName;

      // 🧹 Delete old cover photo if applicable
      if (
        req.tour &&
        req.tour.imageCover &&
        req.tour.imageCover !== 'default.jpg'
      ) {
        const oldCoverPath = path.join('public/img/tours', req.tour.imageCover);
        try {
          await fs.unlink(oldCoverPath);
        } catch (err) {
          console.warn(`⚠️ Failed to delete old cover photo: ${err.message}`);
        }
      }
    } catch (err) {
      return next(new AppError('Error processing cover image', 500));
    }
  }

  // 🟢 Handle images (gallery)
  if (req.files.images && Array.isArray(req.files.images)) {
    for (let i = 0; i < req.files.images.length; i++) {
      const file = req.files.images[i];
      const fileName = `tour-${tourId}-${timestamp}-${i}.jpeg`;
      const filePath = path.join('public/img/tours', fileName);

      try {
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(filePath);

        req.body.images.push(fileName);

        // 🧹 Delete old image if applicable (assuming req.tour.images exists)
        if (req.tour && req.tour.images && req.tour.images[i]) {
          const oldImagePath = path.join(
            'public/img/tours',
            req.tour.images[i],
          );
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.warn(
              `⚠️ Failed to delete old image at index ${i}: ${err.message}`,
            );
          }
        }
      } catch (err) {
        return next(new AppError('Error processing image', 500));
      }
    }
  }

  next();
}); 



