const express =require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
const router =express.Router({mergeParams:true});

router.use(authController.protect);

router
.route('/')
.get(reviewController.getallReviews)
.post(authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.newReview);

router
.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user','admin'),reviewController.updateReview)
.delete(authController.restrictTo('user','admin'),reviewController.deleteReview);

module.exports = router;
