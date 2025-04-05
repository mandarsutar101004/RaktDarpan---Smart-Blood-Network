const express = require("express");
const {
  sendBloodRequestNotification: sendEmail,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/sendNotification", async (req, res) => {
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
