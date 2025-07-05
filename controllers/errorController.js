import { title } from "process";
import AppError from "./../utils/appError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400); // Any error that will go through AppError has the isOperational field set to true
};

const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate key value: ${value} for field: ${field}. Please use another value!`
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => {
  return new AppError('Invalid token. Please login again', 401);
}

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again', 401);
}


const renderErrorPage = (res, statusCode, message) => {
  res.status(statusCode).render('error', {
    title: 'Something went wrong',
    message,
  });
};

const sendErrorDev = (err, req, res) => {
  const isAPI = req.originalUrl.startsWith('/api');

  if (isAPI) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  return renderErrorPage(res, err.statusCode, err.message);
};

const sendErrorProd = (err, req, res) => {
  const isAPI = req.originalUrl.startsWith('/api');

  if (isAPI) {
    // Operational errors coming from Moongose or somewhere we trust
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('ERROR 🔥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  if (err.isOperational) {
    return renderErrorPage(res, err.statusCode, err.message);
  }

  console.error('ERROR 🔥', err);
  return renderErrorPage(res, err.statusCode, 'Please try again');
};


const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; 
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if(process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if(error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if(error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    sendErrorProd(error, req, res);
  
  
}
}

/* 
  *** CastError (Handling incorrect IDS) ***
  *** ValidationError (for invalid values entered) ***
  *** MongoError for duplicate field names (unique constraint applied) ***
  *** path is the name of the field where we have invalid data ***
  *** value is the data we passed in
*/

export default globalErrorHandler;