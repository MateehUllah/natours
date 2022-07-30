const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');

exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //1 get tour data from collection
  const tours = await Tour.find();
  //2 Build template

  //3 Render that template data using tour data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guide)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //2) Build template
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  //3)Render
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const UpdatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: UpdatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2) Find tours with returned ID's
  const tourId = bookings.map((el) => el.tour);
  const tours = await Tour.find({
    _id: {
      $in: tourId,
    },
  });
  res.status(200).render('overview', { title: 'My tours', tours });
});
