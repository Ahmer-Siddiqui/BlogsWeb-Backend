const mongoose = require("mongoose");

const { MODE, MONGO_URI_COMPASS, MONGO_URI_ATLAS } = process.env;

const connectDB = async () => {  
 
  const MONGO_URI = MODE === 'dev' ? MONGO_URI_COMPASS : MONGO_URI_ATLAS;

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`Database: ${conn.connection.host}/${conn.connection.name}, connected successfully!`);
  } catch (err) {
    console.log("Database connection failed!", err);
    process.exit(1);
  }
};

module.exports = connectDB;