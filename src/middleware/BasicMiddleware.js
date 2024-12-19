const ErrorHandler = require("../utils/apiHandlers/ErrorHandler");

const { MODE } = process.env;

const DevAccessAPIOnly = (req, res, next) => {
  next();
  // if (MODE === "dev") {
  // } else {
  //   return ErrorHandler("You cannot access this API", 401, res);
  // }
};


const paramIdChecker = async (req, res, next) => {
  
  try {
    const id = req?.params?.id;
    
    if (id && id?.length != 24) return ErrorHandler("Id must be a 24 character hex string ", 400, res);
    next();
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

module.exports = { DevAccessAPIOnly, paramIdChecker };
