import React, { useState } from "react";
import axios from "axios";
import "./ResetPassword.css";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength * 25);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/otp/resetPassword",
        { email, otp, newPassword }
      );

      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Error resetting password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rp-container">
      <h2 className="rp-title">Reset Password</h2>
      <form className="rp-form" onSubmit={handleSubmit}>
        <div className="rp-form-group">
          <label className="rp-label">Email</label>
          <input
            type="email"
            className="rp-input rp-email"
            value={email}
            readOnly
          />
        </div>

        <div className="rp-form-group">
          <label className="rp-label">OTP</label>
          <input
            type="text"
            className="rp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <div className="rp-form-group">
          <label className="rp-label">New Password</label>
          <input
            type="password"
            className="rp-input"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              checkPasswordStrength(e.target.value);
            }}
            required
            minLength="6"
          />
          <div className="rp-strength-meter">
            <div
              className="rp-strength-fill"
              style={{
                width: `${passwordStrength}%`,
                backgroundColor:
                  passwordStrength < 50
                    ? "#ef4444"
                    : passwordStrength < 75
                    ? "#f59e0b"
                    : "#10b981",
              }}
            />
          </div>
        </div>

        <div className="rp-form-group">
          <label className="rp-label">Confirm Password</label>
          <input
            type="password"
            className="rp-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="rp-button" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>

        {message && (
          <div
            className={`rp-message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
