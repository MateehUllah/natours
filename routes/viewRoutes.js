const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authenticationController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

// router.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src  'self' api.mapbox.com",
//     "script-src-elem 'self' api.mapbox.com"
//   );
//   next();
// });
router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// login
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
module.exports = router;
