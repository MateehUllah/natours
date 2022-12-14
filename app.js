const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookie_parser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();
//to trust the proxies
app.enable('trust-proxy');

//FIXME: Some Challanges are missing

//Start Express application
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //it will create slash itself
//1) Global Middleware
//Implementing CORS
app.use(cors());
//Access-Control-Allow-Origin
// api at different domain and front end on different domain
// app.use(cors({
//   origin:'https://www.natours.com'
// }))
//OPTIONS is another http method
//CORS are use to allow non simple request
//serving static file
//send req when there is pre flight face
app.options('*', cors());
//below is for specific route
// app.options('/api/v1/tours/:id',cors())
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP header
app.use(helmet());
//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// //serving static file
// app.use(express.static(`${__dirname}/public`));

//Limit request from same api
const limiter = rateLimit({
  max: 100, //Maximum 100 request
  windowMS: 60 * 60 * 1000, //1 hour
  message: 'Too many request from this IP.Please try again in an hour',
});

app.use('/api', limiter);
//We dont want to parse body.Therefore we use route here
//
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
// Body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookie_parser());
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);
//Data sanitization against NoSQL query injection
//We can login through writing query lets suppose the password is correct and in email field we write email $gt:""

app.use(mongoSanitize()); //this function(mongoSantitize()) will return middleware function
//Data sanitization agains XSS
app.use(xss()); //it will clean malicious html in input
//prevent parameter polution
app.use(
  hpp({
    whitelist: [
      //These parameter allows duplication
      'duration',
      'ratingsQurantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//do compression
app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
//4) Server
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
}); //all methods
//this will work because  our request will never reach here if the
//above router will execute the request.
//if we pass something in next express will assume that it is error
//it happends automatically
app.use(globalErrorHandler);
module.exports = app;
