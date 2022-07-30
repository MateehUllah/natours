const multer = require('multer');
const sharp = require('sharp');

const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();
//This function will check that it is image or not if not it will send error

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image Please Upload only Images', 404), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerfilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// if we have single  image then single else array if bot not then fields
// upload.single('image') req file
// upload.array('imagesCover',5) req.files

exports.resizeTourImage = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
  //1)Cover Image
  req.body.imageCover = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
  //console.log(req.body.imageCover);
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //2) Images
  req.body.images = [];
  //if a function is use to get data more than one
  //async happen in loop and we use map to save all promises then we await all promises
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tours-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
          quality: 90,
        })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.UpdateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      //pliminary Stage
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id:null
        _id: '$difficulty',
        //_id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: -1 } },
    // {
    //   $match: {
    //     _id: { $ne: 'easy' },
    //   },
    // },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    new AppError('Please provide latitude and longitude values!!!', 400);
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  //In geo json we have to specify lng first then lat
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    new AppError('Please provide latitude and longitude values!!!', 400);
  }
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },

      //always need to be first stage in geo special query
      //There are also geospecial index like 2dsphere
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  //console.log(distance);
  res.status(200).json({
    status: 'success',
    results: distance.length,
    data: {
      data: distance,
    },
  });
});
