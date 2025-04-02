const nodemailer = require("nodemailer");

// Email notification function
exports.sendNotification = async (req, res) => {
  try {
    const { emails, bloodGroup, location } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: "No emails provided" });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
      },
    });

    // Email message details
    const mailOptions = {
      from: "your-email@gmail.com",
      to: emails.join(","), // Send email to multiple donors
      subject: "Urgent Blood Donation Request",
      text: `Dear Donor,\n\nA patient nearby needs ${bloodGroup} blood. Please help if available. Location: ${location}.\n\nThank you!\nSmart Blood Network`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email notifications sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email notifications" });
  }
};
