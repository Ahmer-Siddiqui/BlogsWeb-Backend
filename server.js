require("dotenv").config({ path: ".env" });
const cors = require("cors");
const express = require("express");
const ErrorHandler = require("./utils/apiHandlers/ErrorHandler");
const handleValidationError = require("./utils/apiHandlers/ValidationErrorHandler");
const app = express();
const { PORT } = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", require("./routes/userRoutes"));
app.get("/", (_, res) => res.send("blog-server live!"));

app.use((err, req, res, next) => {
  try {
    if (err.name === "ValidationError") {
      const errMessage = handleValidationError(err)[0].message;
      return ErrorHandler(errMessage, 400, res);
    }
    return ErrorHandler(err.message, 500, res);
  } catch (error) {
    return ErrorHandler(err.message, 500, res);
  }
});
app.listen(PORT || 8000, () => {
  console.log(`⚙️ Server is running at port : ${PORT}`);
});
