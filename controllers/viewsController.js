import { title } from "process";
import { Tour } from "./../models/tourModels.js";
import catchAsyncError from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";


export const getOverview = catchAsyncError(async (req, res, next) => {
  // TODO 1. Get all tours from Tour DB
  // 1) Get pagination parameters from query string
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 9; // Show 9 tours per page
  const skip = (page - 1) * limit;

  // 2) Get total count of tours for pagination info
  const totalTours = await Tour.countDocuments();
  const totalPages = Math.ceil(totalTours / limit);

  // 3) Get tours for current page
  const tours = await Tour.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // 4) Calculate pagination info
  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    totalResults: totalTours,
    startItem: skip + 1,
    endItem: Math.min(skip + limit, totalTours),
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  // TODO 2. Build template

  // TODO 3. Render template with data from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
    pagination: totalPages > 1 ? pagination : null
  });
});

export const getTour = catchAsyncError(async (req, res, next) => {
  //TODO 1. Get tour data from DB, populate it with the reviews data, the guide data is already prepopulated
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'reviews',
      select: {
        review: 1, rating: 1, user: 1
      }
    });
    if(!tour) {
      return next(new AppError(`There's no tour with that name ${req.params.slug}`, 404));
    }

  //TODO 2. Build the template

  // TODO 3. Render template with the data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
    user: res.locals.user,
  });
});

export const getLoginForm = async (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account',
  })
}

export const getSignUpForm = async (req, res) => {
  res.status(200).render('signup', {
    title: 'Create an account',
  })
}