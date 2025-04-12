import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";
import sbn6 from "../Photos/sbn6.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    role: "Donor",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/api/users/login",
        formData
      );
      localStorage.setItem("authToken", response.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <div className="login-left-content">
          <img src={sbn6} alt="Logo" className="login-brand-logo" />
          <h1 className="login-welcome-text">
            Welcome Back to Our Life-Saving Community
          </h1>
          <p className="login-welcome-subtext">
            Every login brings us closer to saving more lives. Sign in to
            continue your journey.
          </p>
          <div className="login-benefits">
            <div className="login-benefit-item">
              <span className="login-benefit-icon">💉</span>
              <span>Track your donations</span>
            </div>
            <div className="login-benefit-item">
              <span className="login-benefit-icon">🏥</span>
              <span>Emergency notifications</span>
            </div>
            <div className="login-benefit-item">
              <span className="login-benefit-icon">🔄</span>
              <span>Regular health checkups</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && <div className="login-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-form-label">I am a</label>
              <div className="login-role-selector">
                {[
                  "Donor",
                  "Recipient",
                  "Hospital",
                  "Organization",
                  "Admin",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`login-role-option ${
                      formData.role === option ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        role: option,
                      }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="email" className="login-form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="login-form-input"
                placeholder="john@example.com"
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password" className="login-form-label">
                Password
              </label>
              <div className="login-password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="login-form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="login-form-options">
              <label className="login-remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="login-forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="login-register-link">
              Don't have an account? <Link to="/register">Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
