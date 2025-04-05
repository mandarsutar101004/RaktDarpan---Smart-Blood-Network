const nodemailer = require("nodemailer");
require("dotenv").config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "raktdarpan2024@gmail.com",
    pass: "mnrd fljh qkri krtc",
  },
  tls: {
    rejectUnauthorized: false, // 👈 Add this line to ignore self-signed cert issues
  },
});

/**
 * Sends urgent blood request email
 * @param {Object} requestData - Contains all required fields
 * @returns {Promise<Object>} - { success: boolean, message?: string, error?: string }
 */
const sendBloodRequestNotification = async (requestData) => {
  try {
    // Destructure required fields
    const {
      recipientEmail,
      recipientName,
      bloodGroup,
      patientName,
      patientLocation,
      patientContact,
      hospitalName,
      hospitalAddress,
      city,
      district,
      state,
      country,
      patientAge,
      patientGender,
      requiredDate,
    } = requestData;

    // Validate required fields
    if (
      !recipientEmail ||
      !recipientName ||
      !bloodGroup ||
      !patientName ||
      !patientLocation ||
      !patientContact ||
      !hospitalName ||
      !hospitalAddress ||
      !city ||
      !district ||
      !state ||
      // !country ||
      // !patientAge ||
      !patientGender ||
      !requiredDate
    ) {
      console.log("Received requestData:", requestData); // 👈 Correct placement
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Generate the exact email text as specified
    const emailText = `
Dear ${recipientName}, 👋

🩸 We are looking for a ${bloodGroup} donor for a patient admitted at 🏥 ${requestData.hospitalName}. If you have this blood group and are available to donate, please let us know.

🧑‍⚕️ *Patient Details*:
👤 Name: ${patientName}
🚻 Gender: ${requestData.patientGender}
📆 Required Date: ${requestData.requiredDate}
📍 Location: ${requestData.hospitalAddress}, ${requestData.city}, ${requestData.district}, ${requestData.state}, ${requestData.country}

📞 You may contact ${patientName} or their attendant directly at ${patientContact}, or feel free to reach out to our team at 📧 raktdarpan2024@gmail.com / ☎️ 0123456789 if that’s more convenient.

🙏 Your help could truly save a life. Thank you for your compassion and support! ❤️

Warm regards,  
Team RaktDarpan 💌
`;

    // Send email
    await transporter.sendMail({
      from: '"Team RaktDarpan" <raktdarpan2024@gmail.com>',
      to: recipientEmail,
      subject: "🚨 Urgent Blood Requirement – Please Help Save a Life",
      text: emailText,
    });

    return {
      success: true,
      message: "Blood request notification sent successfully",
    };
  } catch (error) {
    console.error("Notification error:", error);
    return {
      success: false,
      error: "Failed to send notification",
      details: error.message,
    };
  }
};

module.exports = { sendBloodRequestNotification };
