const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Admin = require("../models/AdminModel");
const ErrorHandler = require("../utils/apiHandlers/ErrorHandler");

const { AUTH_USERNAME: username, AUTH_PASSWORD: password } = process.env;

const isAuthenticated = async (req, res, next) => {
  try {
    const tokenHeader = req.header("Authorization");
    if (!tokenHeader) {
      return ErrorHandler("Unauthorized: Token not provided", 401, res);
    }
    const [tokenType, token] = tokenHeader.split(" ");

    if (tokenType !== "Bearer" || !token) {
      return ErrorHandler("Unauthorized: Invalid token format", 401, res);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType === "user") {
      req.user = await User.findById(decoded.id);
      req.user.userType = "user";
    }

    if (decoded.userType === "admin") {
      req.user = await Admin.findById(decoded.id);
      req.user.userType = "admin";
    }

    if (decoded.userType === "merchant-employee") {
      req.user = await MerchantEmployee.findById(decoded.id);
      req.user.userType = "merchant-employee";
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ErrorHandler("Unauthorized: Token expired", 401, res);
    }
    return ErrorHandler("Forbidden: Invalid token", 403, res);
  }
};

// Main Modules Middleware
const isUser = (req, res, next) => {
  if (req.user.userType === "user") {
    next();
  } else {
    return ErrorHandler("Unauthorized: You're not user!", 401, res);
  }
};

const isMerchant = (req, res, next) => {
  if (req.user.userType === "merchant") {
    next();
  } else {
    return ErrorHandler("Unauthorized: You're not merchant!", 401, res);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.userType === "admin") {
    next();
  } else {
    return ErrorHandler("Unauthorized: You're not admin!", 401, res);
  }
};

// Sub-Modules Middleware
const isMerchantEmployee = (req, res, next) => {
  if (req.user.userType === "merchant-employee") {
    next();
  } else {
    return ErrorHandler(
      "Unauthorized: You're not a Merchant Employee!",
      401,
      res
    );
  }
};

// Super-Admin Middlewar
const SuperAuth = async (req, res, next) => {
  const tokenHeader = req.header("Authorization");
  if (!tokenHeader) {
    return ErrorHandler(
      "Unauthorized: Username & Password required!",
      401,
      res
    );
  }

  const base64Credentials = tokenHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [USERNAME, PASSWORD] = credentials.split(":");

  if (USERNAME == username && PASSWORD == password) {
    return next();
  }

  return ErrorHandler("Invalid credentials", 401, res);
};

module.exports = {
  isAuthenticated,
  // Main Modules Middleware
  isUser,
  isAdmin,
  isMerchant,
  // Sub-Modules Middleware
  isMerchantEmployee,
  // Super-Admin Middleware
  SuperAuth,
};
