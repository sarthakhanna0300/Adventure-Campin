const appError =require('./../utils/appError');

const handleJWTError = err =>{
    const message = 'Invalid token.Please log in again';
    return new appError(message,400);
}

const handleTokenExpiredError  = err =>{
    const message = 'Your token has expired.Please log in again';
    return new appError(message,401);
}


const  handleCastErrorDB =err => {
    const message =  `Invalid ${err.path}: ${err.value}`;
    return new appError(message,400);
} ;
const  handleValidationErrorDB =err => {
    const errors = Object.values(err.errors).map(el=> el.message);

    const message =  `Invalid input data. ${errors.join('. ')}`;
    return new appError(message,400);
} ;


const handleDuplicateFieldsDB= err =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new appError(message,400);  
} ;

const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    }
  
    // B) RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  };
  
  const sendErrorPro = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
      // A) Operational, trusted error: send message to client
      if (err.isOperational) {
        return res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      }
      // B) Programming or other unknown error: don't leak error details
      // 1) Log error
      console.error('ERROR 💥', err);
      // 2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  
    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      console.log(err);
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.'
    });
  };

  
module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res);
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = {...err}    
        error.message =err.message;
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError(error);
        sendErrorPro(error,req,res);
    }

}