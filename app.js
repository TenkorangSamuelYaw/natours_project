// 1. PACKAGES
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 2. MIDDLEWARES
app.use(express.json()); // Middleware that parses data from the client to the server using req.body
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // This middleware gives a log of the incoming request in the console
}
app.use(express.static(`${__dirname}/public`));
// Creating my own middleware here
app.use((req, res, next) => {
    req.responseTime = new Date().toISOString();
    next();
});

// 3. Mounting routers
app.use('/api/v1/tours', tourRouter); // Middleware for tours route
app.use('/api/v1/users', userRouter); // Middleware for user route

// NOTE Handling unhadled routes in our code
// 1. Make it sure it is last because if it comes before all the routes or in between the routes, it will be called before them
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // Any argument passed to next() is assumed as an error
});

// NOTE ERROR HANDLING MIDDLEWARE (4) ARGUMENTS
app.use(globalErrorHandler); 

export default app;

