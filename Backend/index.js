const express = require("express");
const dotenv = require("dotenv");
require("dotenv").config();
const colors = require("colors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoute");
const notificationRoutes = require("./routes/notificationRoute");
const campRoutes = require("./routes/campRoute");

//Create Server
const app = express();

//Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//Routes
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/camps", campRoutes);

//MongoDB Connection
connectDB();

//Create port to listen
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${
      process.env.DEV_MODE || "development"
    } Mode On Port ${PORT}`.bgBlue.white
  );
});
