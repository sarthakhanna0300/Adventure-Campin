const express= require('express');
const path = require('path');
const fs =require('fs');
const morgan =require('morgan');
const tourRouter =require('./router/tourRoutes');
const reviewRouter =require('./router/reviewRoutes');
const viewsRouter =require('./router/viewsRoutes');
const userRouter =require('./router/userRoutes');
const cookieParser = require('cookie-parser');
const globalErrorHandler =require('./controller/errorController');

const appError =require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet =require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp =require('hpp');
const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));

app.use(helmet());
//Middlewares
if(process.env.NODE_ENV === 'development')
    {
        app.use(morgan('dev'));
    }

const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:"Too many request from this Id,try again in 1 hour!"
});

app.use('/api',limiter);

app.use(express.json({limit : '10kb'})); 
app.use(express.urlencoded({extended:true,limit : '10kb'})); 

app.use(cookieParser());

app.use(mongoSanitize());   
app.use(xss());
app.use(hpp({
    whitelist:['duration','ratingAverage','ratingQuantity','maxGroupSize','difficulty','price']
}));

app.use((req,res,next)=>{
    // console.log(req.cookies);
    next();
})

app.use('/',viewsRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all('*',(req,res,next)=>{
    next(new appError(`Cant find ${req.originalUrl} on the server`,404));
});

app.use(globalErrorHandler);

module.exports =app;