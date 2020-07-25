const Review= require('./../models/reviewModel');
const appError= require('./../utils/appError');
// const catchAsync= require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req,res,next)=>{
    if(!req.body.tour) req.body.tour=req.params.tourId;
    if(!req.body.user) req.body.user=req.user.id;   
    next();
}

exports.getallReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.newReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
