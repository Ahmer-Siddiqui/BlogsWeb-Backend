const User = require("../../models/UserModel");
const ErrorHandler = require("../../utils/apiHandlers/ErrorHandler");
const SuccessHandler = require("../../utils/apiHandlers/SuccessHandler");
const { validateRequiredFields } = require("../../utils/helperFunctions");
const sendMail = require("../../utils/sendMail");

const hostName = process.env.HOST_NAME;

const signUp = async (req, res) => {
  const { firstName, lastName, cnicNumber, email, password } = req.body;

  if (!firstName || !lastName || !cnicNumber || !email || !password) {
    return ErrorHandler("Please provide all required fields", 400, res);
  }

  let user = await User.findOne({ email });

  if (user && !user?.isDeleted)
    return ErrorHandler("User already exists", 400, res);

  if (password.length < 6) {
    return ErrorHandler(
      "Your password length should be atleast six!",
      400,
      res
    );
  }

  let userCred = {
    firstName,
    lastName,
    cnicNumber,
    email,
    password,
  };

  if (user?.isDeleted) {
    userCred["isDeleted"] = false;
    await User.findOneAndUpdate({ email }, userCred, { runValidators: true });
  } else {
    await User.create(userCred);
  }

  return SuccessHandler(null, 201, res, "User registered successfully");
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ErrorHandler("Please provide email and password", 400, res);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) return ErrorHandler("User not found!", 400, res);
  if (user?.isDeleted == true)
    return ErrorHandler("User not found!", 400, res, { isModalShow: true });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return ErrorHandler("Invalid credentials", 400, res);

  const jwtToken = user.getJWTToken();

  return SuccessHandler(jwtToken, 200, res, `Logged in successfully!`);
};

const updateProfile = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ErrorHandler("Please provide email and password", 400, res);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) return ErrorHandler("User not found!", 400, res);

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !profile ||
    !cnicNumber
  ) {
    return ErrorHandler("Please provide all fields", 400, res);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return ErrorHandler("Invalid credentials", 400, res);

  const jwtToken = user.getJWTToken();

  return SuccessHandler(jwtToken, 200, res, `Logged in successfully!`);
};

const getCredentials = async (req, res) => {
  const user = req.user.toObject();

  // Validations:
  const requiredFieldsArr = [
    "firstName",
    "lastName",
    "email",
    "password",
    "cnicNumber",
  ];
  const validationErrorMessage = validateRequiredFields(
    user,
    requiredFieldsArr
  );
  delete user.password;
  if (validationErrorMessage)
    return SuccessHandler(
      { ...user, isProfileCompleted: false },
      200,
      res,
      `User credentials retrieved!`
    );
  if (!validationErrorMessage)
    return SuccessHandler(
      { ...user, isProfileCompleted: true },
      200,
      res,
      `User credentials retrieved!`
    );
  // return ErrorHandler(validationErrorMessage, 400, res);
  if (!user) {
    return ErrorHandler("User credentials not found", 403, res);
  }
};

const setPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return ErrorHandler("User not found", 403, res);
  }

  // Set the new password and save
  user.password = password;
  await user.save();
  return SuccessHandler(null, 200, res, `User password updated!`);
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("-password");

  if (!user) return ErrorHandler("User email not found", 403, res);

  const jwtToken = user.getJWTToken();
  const url = `${hostName}/set-password?token=${jwtToken}`;

  const response = await sendMail("Your Forget Link", email, { url }, "forget");

  if (response.status) {
    return SuccessHandler(null, 200, res, `User email retrieved!`);
  }

  return ErrorHandler("Internal server error", 500, res);
};

module.exports = {
  signUp,
  login,
  forgetPassword,
  setPassword,
  getCredentials,
  updateProfile,
};
