// const errorMiddleware = (err, req, res, next) => {
//     console.error(err.stack); // Log the error (useful for debugging)

//     res.status(err.status || 500).json({
//         success: false,
//         message: err.message || 'Internal Server Error',
//     });
// };

//  errorMiddleware;


// errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  export default errorHandler;