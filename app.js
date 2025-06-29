// 1. PACKAGES
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import viewRouter from './routes/viewRoutes.js'
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import {rateLimit} from 'express-rate-limit';
import helmet from 'helmet';
import monogoSanitize from 'express-mongo-sanitize';
import {xss} from 'express-xss-sanitizer';
import hpp from 'hpp';
import cookieParser from 'cookie-parser'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 2. MIDDLEWARES
// Set Security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://cdn.jsdelivr.net',
        'blob:',
        "'unsafe-inline'", // for Mapbox workers (sometimes required)
      ],
      styleSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com',
        "'unsafe-inline'",
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'ws://127.0.0.1:1234', // 👈 WebSocket for Parcel HMR
      ],
      imgSrc: ["'self'", 'data:', 'https://api.mapbox.com'],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  }),
);

// Middleware that parses data from the client to the server using req.body
app.use(express.json({
  limit: '10kb' // Limit data parsed in req.body to 10KB
})); 

app.use(cookieParser()); // read cookie from the browser when user makes a request

// Data sanitization against NO SQL query injection
app.use(monogoSanitize());
// Data sanitization against XSS(Cross site scripting)

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // This middleware gives a log of the incoming request in the console
}
// Limit requests from same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Allow 100 requests from same IP per which window(15 mins)
  message: "Too many requests from this IP, please try again in 15 minutes!"
});
app.use('/api', limiter); // Apply to all routes another /api

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Creating my own middleware here
app.use((req, res, next) => {
    req.responseTime = new Date().toISOString();
    console.log(req.cookies); // Log the cookie coming from the req
    next();
});

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

// 3. Mounting routers
app.use('/', viewRouter); // All view routes mounted on the root route
app.use('/api/v1/tours', tourRouter); // Middleware for tours route
app.use('/api/v1/users', userRouter); // Middleware for user route
app.use('/api/v1/reviews', reviewRouter); // Middleware for review route

// NOTE Handling unhadled routes in our code
// 1. Make it sure it is last because if it comes before all the routes or in between the routes, it will be called before them
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // Any argument passed to next() is assumed as an error
});

// NOTE ERROR HANDLING MIDDLEWARE (4) ARGUMENTS
app.use(globalErrorHandler); 

export default app;

