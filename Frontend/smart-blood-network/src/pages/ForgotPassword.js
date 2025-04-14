import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/otp/forgotPassword",
        { email }
      );

      setMessage(response.data.message);
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error sending OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <h2 className="fp-title">Forgot Password</h2>
      <form className="fp-form" onSubmit={handleSubmit}>
        <div className="fp-form-group">
          <label className="fp-label">Email</label>
          <input
            type="email"
            className="fp-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="fp-button" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send OTP"}
        </button>

        {message && (
          <div
            className={`fp-message ${
              message.includes("sent") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
