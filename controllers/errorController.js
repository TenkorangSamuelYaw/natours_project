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

const sendErrorDev = ((err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
});

const sendErrorProd = ((err, res) => {
  // Operational errors coming from Moongose or somewhere we trust
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming related errors
  } else {
    console.error('ERROR 🔥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
});


const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; 
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
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
    sendErrorProd(error, res);
  
  
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