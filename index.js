require("dotenv").config({ path: ".env" });
const connectDB = require("./src/config/db.js");
const app = require("./src/app.js");
const { MODE, PORT } = process.env; 

connectDB()
  .then(() => {
    if (MODE === "prod") {
      app.listen(); 
    } else {
      app.listen(PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
