const User = require("../../models/UserModel");
const ErrorHandler = require("../../utils/apiHandlers/ErrorHandler");
const SuccessHandler = require("../../utils/apiHandlers/SuccessHandler");

const getAllUsers = async (req, res) => {
  try {
    // Extract page and pageSize from query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    // const pageSize = parseInt(req.query.page) || 2; // Default to 10 items per page if not provided
    const pageSize =  10; // Default to 10 items per page if not provided

    // Calculate the number of documents to skip
    const skip = (page - 1) * pageSize;

    // Fetch users with pagination
    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(pageSize);

    // Get the total number of users for pagination info
    const totalUsers = await User.countDocuments();

    // Check if users exist
    if (!users) return ErrorHandler("Users not found!", 400, res);

    // Prepare pagination metadata
    const totalPages = Math.ceil(totalUsers / pageSize);

    // Return paginated results along with pagination info
    return SuccessHandler(
      {
        users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize,
        },
      },
      200,
      res,
      `Users retrieved successfully!`
    );
  } catch (error) {
    console.log("Error:", error);
    return ErrorHandler("Internal server error", 500, res);
  }
};

module.exports = {
    getAllUsers,
};