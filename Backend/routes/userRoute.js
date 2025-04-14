const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  getAllDonors,
  updateUser,
  matchDonors,
  getAllHospitals,
  getAllOrganizations,
  getAllRecipients,
  blockUserByEmail,
  unblockUserByEmail,
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

router.get("/allHospitals", getAllHospitals);

//Get all Recipients
router.get("/allRecipients", getAllRecipients);

//Get all Hospitals
router.get("/allOrganizations", getAllOrganizations);

//Update User
router.put("/updateUser", authMiddleware, updateUser);

//Match Donors
router.post("/matchDonors", matchDonors);


router.put("/blockUser", blockUserByEmail);

router.put("/unblockUser", unblockUserByEmail);

module.exports = router;
