import path from 'path';
import { fileURLToPath } from 'url';
import { Tour } from './../models/tourModels.js'; // Tour model from the database
import catchAsyncError from './../utils/catchAsync.js';
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from './handlerFactory.js';
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
};

export const getTours = getAll(Tour);

export const getTour = getOne(Tour, { path: 'reviews' });

export const createTour = createOne(Tour);

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);

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

/**
 * @desc   Get all tours within a specific distance from a geographical point
 * @route  GET /api/v1/tours-within/:distance/center/:latlng/unit/:unit
 * @param  {Number} distance - Distance to search within (in miles or kilometers)
 * @param  {String} latlng - Latitude and longitude in 'lat,lng' format
 * @param  {String} unit - Unit of distance ('mi' for miles, 'km' for kilometers)
 * @access Public
 */
export const getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Validate that latitude and longitude are provided
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  // Convert distance to radians (required for MongoDB's $centerSphere)
  // Earth radius: 3963.2 mi or 6378.1 km
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // Filter all the tours by the startLocation property
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
