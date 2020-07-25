const express =require('express');
const tourController =require('./../controller/tourController.js');
const authController =require('./../controller/authController.js');
const reviewController =require('./../controller/reviewController.js');
const reviewRouter =require('./reviewRoutes');

const router =express.Router();
router.use('/:tourId/reviews',reviewRouter);


router.route('/top-5-cheap').get(tourController.aliasTopTour,tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect,
    authController.restrictTo('admin','lead-guide','guide'),
    tourController.getMonthyPlan);

router.route('/tours-within/:distance/:center/:latlng/unit/:unit')
.get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);

router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.newTour);  

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.updateTour)
.delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour);

router
.route('/:tourId/reviews')
.post(authController.protect,
    authController.restrictTo('user'),
    reviewController.newReview
    );

module.exports =router;