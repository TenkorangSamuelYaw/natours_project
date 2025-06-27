import { title } from "process";
import { Tour } from "./../models/tourModels.js";
import catchAsyncError from "./../utils/catchAsync.js";


export const getOverview = catchAsyncError(async (req, res, next) => {
  // TODO 1. Get all tours from Tour DB
  const tours = await Tour.find();
  for (let index = 0; index < tours.length; index++) {
    console.log(tours[index].slug);
  }
  // TODO 2. Build template

  // TODO 3. Render template with data from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});

export const getTour = catchAsyncError(async (req, res, next) => {
  //TODO 1. Get tour data from DB, populate it with the reviews data, the guide data is already prepopulated
  const tour = await Tour.findOne({ _id: req.params.id })
    .populate({
      path: 'reviews',
      select: {
        review: 1, rating: 1, user: 1
      }
    });

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