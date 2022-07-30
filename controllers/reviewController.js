const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUsersId = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.UpdateOne(Review);
exports.getAllReview = factory.getAll(Review);
