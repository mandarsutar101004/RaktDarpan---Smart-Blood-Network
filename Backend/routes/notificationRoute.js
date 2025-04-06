const express = require("express");
const {
  sendBloodRequestNotification: sendNotification,
} = require("../controllers/notificationController");
const {
  sendEmailController: sendEmail,
} = require("../controllers/sendEmailController");

const router = express.Router();

router.post("/sendNotification", async (req, res) => {
  try {
    const result = await sendNotification(req.body);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sendEmail", async (req, res) => {
  try {
    const result = await sendEmail(req.body);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
