const handleValidationError = (err) => {
  if (err.name === "ValidationError") {
    return Object.keys(err.errors).map((key) => {
      return {
        field: key,
        message: err.errors[key].message,
      };
    });
  }
  return null;
};

module.exports = handleValidationError
