const Tour =require('./../models/tourModel'); 
const catchAsync = require('./../utils/catchAsync');
const appError =require('./../utils/appError');
const factory = require('./handlerFactory');
const multer =require('multer');
const sharp =require('sharp');

const multerStorage=multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }
    else
        {
            cb(new appError('Not an Image,Please upload images only',400),false)
        }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadTourImages = upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
]);

exports.resizeUserPhoto = (req,res,next)=>{
    if (!req.file) return next();
    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
    .rotate()
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`);    
next();


}


exports.aliasTopTour = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort ='-ratingsAverage,price';
    req.query.field = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour); 
exports.getTour = factory.getOne(Tour,{path:'reviews'});
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);   
exports.newTour= factory.createOne(Tour);

exports.getTourStats = catchAsync(async (req,res,next)=>{
        const stats = await Tour.aggregate([
            {
                $match :{ ratingAverage:{ $gte : 4.5 }}
            },
        {
            $group:{
                _id : {$toUpper: '$difficulty'},    
                numTours : { $sum : 1 },    
                numRatings : {$sum:'$ratingsQuantity'},
                avgRating  : {$avg:'$ratingAverage'},
                avgPrice : {$avg:'$price'},
                minPrice : {$min:'$price'},
                maxPrice : {$max:'$price'}
            }
        },
        {
            $sort:{ avgPrice:1}     
        }
        ]);
        res.status(201).json({
            status:"Sucess",
            data:{
                stats
            }
        });
    
})

exports.getMonthyPlan = catchAsync(async(req,res,next)=>{
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates'
            },
        {
            $match:{
                    startDates : {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
        },
        {
            $group :{
                _id:{$month:'$startDates'},
                numTourStarts:{$sum :1},
                tours:{ $push: '$name'}
            }
        },
        {
            $addFields : {month : '$_id'}
        },
        {
            $sort : {numTourStarts:-1}
        },
        {
            $limit:12
        }

        ]);
        res.status(201).json({
            status:"Sucess",
            data:{
                plan
            }
        });
}) ;

exports.getToursWithin = catchAsync(async(req,res,next) =>{
    const { distance ,latlng, unit} = req.params;
    const [lat,lng] =latlng.split(',');
    const radius = unit ==='mi'? distance/3963.2 : distance/6378.1; 
    if(!lat || !lng){
        next(new appError('Please provide latitude and longitute in format lat,lng.',400))
    }

    const tours=await Tour.find(
        {startLocation:{ $geoWithin : { $centerSphere : [[lng,lat],radius]} }}
    );

    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    })
});

exports.getDistances = catchAsync(async(req,res,next)=>{
    const { latlng, unit} = req.params;
    const [lat,lng] =latlng.split(',');
    const multiplier = unit ==='mi'? 0.000621371 : 0.001; 
    
    if(!lat || !lng){
        next(new appError('Please provide latitude and longitute in format lat,lng.',400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near : {
                    type: 'Point',
                    coordinates :[ lng * 1,lat * 1]
                },
                distanceField:'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])   
    res.status(200).json({
        status:'success',
        data:{
            data: distances
        }
    })
});
