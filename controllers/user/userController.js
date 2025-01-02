const ErrorHandler = require("../../utils/apiHandlers/ErrorHandler");
const SuccessHandler = require("../../utils/apiHandlers/SuccessHandler");
const userData = require("../../data/blogsData");

const hostName = process.env.HOST_NAME;

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ErrorHandler("Please provide email and password", 400, res);
  }

  const foundUser = userData.find((user) => user.email === email && user.password == password);
  if (!foundUser) return ErrorHandler("User not found!", 400, res);

  return SuccessHandler(foundUser, 200, res, `Logged in successfully!`);
};   

module.exports = {
  login
};
