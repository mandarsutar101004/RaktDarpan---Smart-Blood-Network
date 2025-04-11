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

router.post(
  "/matchCamps",
  authMiddleware,
  checkRole(["Donor", "Recipient"]),
  campController.matchCamps
);

router.put(
  "/updateCamp",
  authMiddleware,
  checkRole(["Hospital", "Organization"]),
  campController.updateCamp
);

router.delete(
  "/deleteCamp",
  authMiddleware,
  checkRole(["Hospital", "Organization"]),
  campController.deleteCamp
);

module.exports = router;
