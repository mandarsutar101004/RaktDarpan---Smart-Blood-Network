const express = require("express");
const { sendOTP, resetPassword } = require("../controllers/otpController");
const router = express.Router();

router.post("/forgotPassword", sendOTP);

router.post("/resetPassword", resetPassword);

module.exports = router;