const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authenticationController');
//tourId is not access so we use merge params
//each router has access to its own parameters
//To access other router's parameter we have to
//set mergeparams true
//We set up nested router because user login hoga or tour id url say milyega
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUsersId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
