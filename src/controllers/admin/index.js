// Models
const Admin = require("../../models/AdminModel");
// Utils
const ErrorHandler = require("../../utils/apiHandlers/ErrorHandler");
const SuccessHandler = require("../../utils/apiHandlers/SuccessHandler");
const sendMail = require("../../utils/sendMail");
const { deleteFile, saveFile } = require("../../utils/storageHandler");

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return ErrorHandler("Please provide all required fields", 400, res);
    }

    const user = await Admin.findOne({ email });
    if (user) return ErrorHandler("Admin already exists", 400, res);

    if (password.length < 6) {
      return ErrorHandler(
        "Your password length should be atleast six!",
        400,
        res
      );
    }

    await Admin.create({ name, email, password });

    const response = await sendMail(
      "Welcome",
      email,
      { name, email, userType: "admin" },
      "welcome"
    );

    if (!response.status) {
      return ErrorHandler(response.message, 404, res);
    }

    return SuccessHandler(null, 201, res, "Admin registered successfully");
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ErrorHandler("Please provide email and password", 400, res);
    }
    const user = await Admin.findOne({ email }).select("+password");
    if (!user) return ErrorHandler("Admin not found!", 400, res);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return ErrorHandler("Invalid credentials", 400, res);

    const jwtToken = user.getJWTToken();
    return SuccessHandler(jwtToken, 200, res, `Logged in successfully!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const getCredentials = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Admin.findById(userId).select("-password -__v");
    if (!user) {
      return ErrorHandler("Admin credentials not found", 403, res);
    }
    return SuccessHandler(user, 200, res, `Admin credentials retrieved!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const getAdmins = async (req, res) => {
  try {
    const users = await Admin.find().select("-password -__v");
    if (users.length === 0) {
      return ErrorHandler("Admin credentials not found", 403, res);
    }
    return SuccessHandler(users, 200, res, `Admins credential retrieved!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Admin.findOne({ email }).select("-password");

    if (!user) return ErrorHandler("Admin email not found", 403, res);

    const url = user.generateResetPasswordLink();

    const response = await sendMail("Your Forget Link", email, {url}, "forget");

    if (response.status) {
      return SuccessHandler(null, 200, res, `Admin email retrieved!`);
    }

    return ErrorHandler("Internal server error", 500, res);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const password = req.body.password;

    if (!id || !token) {
      return ErrorHandler("Token and user id are required! ", 403, res);
    }

    const user = await Admin.findById(id);
    if (!user) return ErrorHandler("Admin email not found", 403, res);

    const tokenVerified = user.verifyResetPasswordToken(token);
    if(!tokenVerified) return ErrorHandler("Verification token not verified!", 403, res);

    user.password = password;
    await user.save();

    return SuccessHandler(null, 200, res, `Admin password updated!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return ErrorHandler("Please provide Admin id.", 400, res);

    const user = await Admin.findById(userId).select("-password");
    if (!user) {
      return ErrorHandler("Admin not found", 403, res);
    }

    await Admin.findByIdAndDelete(userId);

    return SuccessHandler(null, 200, res, `Admin Delete Successfully!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const updateCredentials = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    if (!name) return ErrorHandler("Please provide name.", 400, res);
    user.name = name;
    user.save();

    return SuccessHandler(null, 200, res, `Admin Credentials Updated!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!(currentPassword && newPassword))
      return ErrorHandler(
        "Please give both current and new password",
        400,
        res
      );

    if (currentPassword.length < 6 || newPassword.length < 6)
      return ErrorHandler(
        "current or new password are less than 6 character",
        400,
        res
      );
    if (currentPassword === newPassword)
      return ErrorHandler("Both current and new password are same", 400, res);



    const checkPassword = await user.comparePassword(currentPassword);
    if (!checkPassword) return ErrorHandler("Wrong Current Password", 400, res);

    user.password = newPassword;
    user.save();

    return SuccessHandler(null, 200, res, `Password has updated!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

const updateProfile = async (req, res) => {
  try {
    if (req.files) {
      const { profile } = req.files;

      // Delete profile if exist.
      if (req.user.profile) {
        const deleted = await deleteFile({
          fileUrl: req.user.profile,
          fileDirname: 'admin/profiles',
          public: true
        });

        if (!deleted.success) return ErrorHandler(deleted.error, 400, res);
      }

      // Upload new profile to storage.
      const uploaded = await saveFile({
        file: profile,
        fileDirname: 'admin/profiles',
        public: true,
        allowedTypes: 'image'
      })

      if (!uploaded.success) return ErrorHandler(uploaded.error, 400, res);
      req.user.profile = uploaded.fileUrl;

      await req.user.save();

      return SuccessHandler({ profile: uploaded.fileUrl }, 200, res, `Merchant credentials retrieved!`);
    }
    return ErrorHandler(null, 400, res, `Admin File must provide!`);
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};



module.exports = {
  signUp,
  forgetPassword,
  resetPassword,
  login,
  getCredentials,
  getAdmins,
  deleteAdmin,
  updateCredentials,
  changePassword,
  updateProfile,
};
