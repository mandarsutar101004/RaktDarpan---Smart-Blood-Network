const nodemailer = require("nodemailer");

const sendEmailController = async (req, res) => {
  try {
    // 1. Validate request data
    const { senderEmail, message } = req.body;

    if (!senderEmail || !message) {
      return res.status(400).json({
        success: false,
        message: "Both senderEmail and message are required",
      });
    }

    // 2. Configure email transporter (using Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "raktdarpan2024@gmail.com",
        pass: "mnrd fljh qkri krtc",
      },
      // tls: {
      //   rejectUnauthorized: false, // 👈 Add this line to ignore self-signed cert issues
      // },
    });


    // 3. Prepare email options
    const mailOptions = {
      from: senderEmail, // Sender's email from request
      to: "raktdarpan2024@gmail.com", // Fixed recipient
      subject: "Feedback Message", // Fixed subject
      text: message, // Email content from request
      replyTo: senderEmail, // Set reply-to address
    };

    // 4. Send email
    const info = await transporter.sendMail(mailOptions);

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};

module.exports = { sendEmailController };
