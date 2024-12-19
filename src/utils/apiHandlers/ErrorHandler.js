// console.clear()
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    metaData = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = statusCode < 400;
    this.metaData = metaData;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor); 
    }
  }
}


const ErrorHandler = (message, statusCode, res, metadata = null, stack = "") => {
  const result = new ApiError(statusCode, message, metadata, stack)
  console.log(result.stack);
    
    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      metadata: result.metadata,
    });
}; 
module.exports = ErrorHandler;
