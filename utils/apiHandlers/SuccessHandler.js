class ApiResponse {
  constructor(data, statusCode, message = "Successfull") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const SuccessHandler = (data, statusCode, res, message = "") => {
  return res
    .status(statusCode)
    .json(new ApiResponse(data, statusCode, message));
};

module.exports = SuccessHandler;
