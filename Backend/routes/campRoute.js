const express = require("express");
const router = express.Router();
const campController = require("../controllers/campController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleAuthMiddleware");

router.post(
  "/registerCamp",
  authMiddleware,
  checkRole(["Hospital", "Organization"]),
  campController.registerCamp
);

router.get("/allCamps", campController.getAllCamps);

module.exports = router;
