const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  getAllDonors,
  updateUser,
  matchDonors,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//Routes

//Register USer
router.post("/register", registerUser);

//Login User
router.post("/login", loginUser);

//Current User
router.get("/currentUser", authMiddleware, currentUser);

//Get all Donors
router.get("/allDonors", getAllDonors);

//Update User
router.put("/updateUser", authMiddleware, updateUser);

//Match Donors
router.post("/matchDonors", matchDonors);

module.exports = router;
