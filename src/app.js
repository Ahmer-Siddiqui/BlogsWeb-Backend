const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const ErrorHandler = require("./utils/apiHandlers/ErrorHandler");
const handleValidationError = require("./utils/apiHandlers/ValidationErrorHandler");
const autoDeleteWarning = require("./middleware/AutoDeleteWarningMiddleware");

const app = express();

let whitelist = [process.env.HOST_NAME];
let corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};



app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(autoDeleteWarning); 

// Static files
app.use("/public", express.static("public"));

app.use("/api", require("./routes/router"));
app.get("/", (_, res) => res.send("ISMS-server live!"));

app.use((err, req, res, next) => {
  try {
    console.log("err agaya ha");
    
    if (err.name === "ValidationError") {
      const errMessage = handleValidationError(err)[0].message;
      return ErrorHandler(errMessage, 400, res);
    }
    return ErrorHandler(err.message, 500, res);
  } catch (error) {
    return ErrorHandler(err.message, 500, res);
  }
});

module.exports = app;