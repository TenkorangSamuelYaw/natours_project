import path from 'path';
import { fileURLToPath } from 'url';
import {Tour} from './../models/tourModels.js'; // Tour model from the database
import APIFeatures from './../utils/apiFeatures.js'; // API class
import catchAsyncError from './../utils/catchAsync.js'; 
import AppError from './../utils/appError.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

// Function to handle popular 5 best and cheap tours by the user
export const aliasTopTours = (req, res, next) => {
  // Prefill 
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage,summary,difficulty';
  next();
}

/* 
  *** The async function is stored in the fn variable ***
  *** Understand catchAsyncError better from the decorators point of view ***
*/

export const getTours = catchAsyncError(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitfields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

export const getTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({path: 'reviews'}) // Find a document by it's id
  if (!tour) {
    return next(new AppError(`No tour found with the ID: ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour, // In ES 6 because the key-value have the same name, one can be dropped => {tour}
    },
  });
});

export const createTour = catchAsyncError(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

export const updateTour = catchAsyncError(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTour) {
    return next(
      new AppError(`No tour found with the ID: ${req.params.id}`, 404),
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      updatedTour: updatedTour,
    },
  });
});

export const deleteTour = catchAsyncError(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);
  if (!deletedTour) {
    return next(
      new AppError(`No tour found with the ID: ${req.params.id}`, 404),
    );
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Handler for tour statistics
export const getTourStats = catchAsyncError(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // Filter out tours that has rating less than 4.5
    },
    {
      $group: {
        _id: '$difficulty', // _id specifies what the result should be grouped by
        numTours: { $sum: 1 }, // Add 1 to each tour
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // 1 is for ASC and -1 for DESC
    },
    // {
    //   $match: {_id: {$ne: 'easy'}} // Filter out the easy level tours
    // }
  ]);
  console.log(stats);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});

export const getMonthlyPlan = catchAsyncError(async (req, res, next) => {
  const year = parseInt(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // Deconstruct the members in this array into single documents
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 }, // Determines total number of tours within a particular month
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // Add a field called month
    },
    {
      $project: { _id: 0 }, // Removes _id from the result
    },
    {
      $sort: { numTourStarts: -1 }, // This helps to know the most busiest month
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan: plan,
    },
  });
});