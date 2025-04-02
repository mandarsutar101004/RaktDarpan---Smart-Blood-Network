const mongoose = require("mongoose");
const colors = require("colors");
require("dotenv").config();

const mongoURI =
  process.env.MONGO_URL || "mongodb://localhost:27017/SmartBloodNetwork"; // Update with your MongoDB URI

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!".bgMagenta.white);
  } catch (error) {
    console.log(`MongoDB Database Error: ${error.message}`.bgRed.white);
  }
};

module.exports = connectDB;
