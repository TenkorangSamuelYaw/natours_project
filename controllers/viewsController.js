import { Tour } from "./../models/tourModels.js";
import catchAsyncError from "./../utils/catchAsync.js";


export const getOverview = catchAsyncError(async (req, res, next) => {
  // TODO 1. Get all tours from Tour DB
  const tours = await Tourfind();
  // TODO 2. Build template
  // TODO 3. Render template with data from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});

export const getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The forest hiker'
    });
}