const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const ApiError = require('./src/utils/ApiError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	message:"too many request from this ip please try again after 15 minutes"
})

app.use(limiter)
app.use(helmet())

app.use(express.json());
app.use(express.static(`public`));

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//handling router that is undefined and sending it to the errcontroller by next(err)
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middleware
//that will handle all the errors in the function
app.use(globalErrorHandler);
module.exports = app;
