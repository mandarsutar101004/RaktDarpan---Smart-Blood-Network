const Otp = require("../models/otpModel");
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiry
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

    // Save OTP to database
    await Otp.create({ email, otp: otpCode, expiresAt: expiry });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "raktdarpan2024@gmail.com",
        pass: "mnrd fljh qkri krtc",
      },
      tls: {
        rejectUnauthorized: false, // 👈 Add this line to ignore self-signed cert issues
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP for Reset Password Request is ${otpCode}</h2><p>Valid for 10 minutes</p>`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      // 1. Check OTP validity
      const otpRecord = await Otp.findOne({ email, otp });
      if (!otpRecord || otpRecord.expiresAt < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // 2. Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 = salt rounds

      // 3. Update password in User model
      const user = await userModel.findOneAndUpdate(
        { email },
        { $set: { password: hashedPassword } },
        { new: true }
      );

      // 4. Cleanup OTPs
      await Otp.deleteMany({ email });

      res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
  sendOTP,
  resetPassword,
};
