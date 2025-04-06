import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegistrationPage.css";

const RegistrationPage = () => {
  const [role, setRole] = useState("Donor");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const getDesignation = (role) => {
    switch (role) {
      case "Admin":
        return "RaktDarpan Admin";
      case "Hospital":
        return "Hospital Member";
      case "Organization":
        return "Organization Member";
      case "Recipient":
        return "Recipient Member";
      default:
        return "RaktDarpan Member";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    designation: getDesignation("Donor"),
    gender: "",
    dob: "",
    email: "",
    mobile: "",
    bloodGroup: "",
    address: "",
    city: "",
    district: "",
    state: "",
    country: "",
    regNo: "",
    password: "",
  });

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setFormData((prev) => ({
      ...prev,
      designation: getDesignation(newRole),
      ...(newRole === "Hospital" ||
      newRole === "Organization" ||
      newRole === "Admin"
        ? {
            gender: "",
            bloodGroup: "",
            dob: "",
          }
        : {}),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");
  setLoading(true);

  try {
    // Create a clean payload object
    const payload = {
      name: formData.name,
      designation: formData.designation,
      email: formData.email,
      mobile: formData.mobile,
      address: formData.address,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      country: formData.country,
      password: formData.password,
      role,
    };

    // Add role-specific fields
    if (role === "Hospital" || role === "Organization") {
      payload.regNo = formData.regNo;
    } else {
      // Only include these fields for Donor/Recipient/Admin
      payload.gender = formData.gender;
      payload.dob = formData.dob;
      if (role === "Donor" || role === "Recipient") {
        payload.bloodGroup = formData.bloodGroup;
      }
    }

    console.log("Sending payload to backend:", payload);

    const response = await axios.post(
      "http://localhost:8081/api/users/register",
      payload
    );

    alert("Registration successful! Please login.");
    navigate("/login");
  } catch (error) {
    console.error("Registration Error:", error.response?.data || error.message);
    setErrorMessage(
      error.response?.data?.message || "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="reg-container">
      <div className="reg-left-panel">
        <div className="reg-left-content">
          <img src="/logo-white.png" alt="Logo" className="reg-brand-logo" />
          <h1 className="reg-welcome-text">Join Our Life-Saving Community</h1>
          <p className="reg-welcome-subtext">
            Every drop counts. Register today to become part of a network that
            saves lives daily.
          </p>
          <div className="reg-benefits">
            <div className="reg-benefit-item">
              <span className="reg-benefit-icon">💉</span>
              <span>Track your donations</span>
            </div>
            <div className="reg-benefit-item">
              <span className="reg-benefit-icon">🏥</span>
              <span>Emergency notifications</span>
            </div>
            <div className="reg-benefit-item">
              <span className="reg-benefit-icon">🔄</span>
              <span>Regular health checkups</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reg-right-panel">
        <div className="reg-form-container">
          <div className="reg-form-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {errorMessage && (
            <div className="reg-error-message">{errorMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-form-group">
              <label className="reg-form-label">I am a</label>
              <div className="reg-role-selector">
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
                    className={`reg-role-option ${
                      role === option ? "active" : ""
                    }`}
                    onClick={() => {
                      setRole(option);
                      setFormData((prev) => ({
                        ...prev,
                        designation: getDesignation(option),
                        ...(option === "Hospital" ||
                        option === "Organization" ||
                        option === "Admin"
                          ? {
                              gender: "",
                              bloodGroup: "",
                              dob: "",
                            }
                          : {}),
                      }));
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="reg-form-row">
              <div className="reg-form-group">
                <label htmlFor="name" className="reg-form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="John Doe"
                />
              </div>
              <div className="reg-form-group">
                <label className="reg-form-label">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  readOnly
                  className="reg-form-input readonly"
                />
              </div>
            </div>

            {(role === "Donor" || role === "Recipient" || role === "Admin") && (
              <div className="reg-form-row">
                <div className="reg-form-group">
                  <label htmlFor="gender" className="reg-form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="reg-form-select"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="reg-form-group">
                  <label htmlFor="dob" className="reg-form-label">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="reg-form-input"
                  />
                </div>
              </div>
            )}

            {(role === "Hospital" || role === "Organization") && (
              <div className="reg-form-group">
                <label htmlFor="regNo" className="reg-form-label">
                  Registration Number
                </label>
                <input
                  id="regNo"
                  name="regNo"
                  type="text"
                  value={formData.regNo}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="ORG-12345"
                />
              </div>
            )}

            <div className="reg-form-row">
              <div className="reg-form-group">
                <label htmlFor="email" className="reg-form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="john@example.com"
                />
              </div>
              <div className="reg-form-group">
                <label htmlFor="mobile" className="reg-form-label">
                  Mobile
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {(role === "Donor" || role === "Recipient") && (
              <div className="reg-form-group">
                <label htmlFor="bloodGroup" className="reg-form-label">
                  Blood Group
                </label>
                <div className="reg-blood-group-selector">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <button
                        key={group}
                        type="button"
                        className={`reg-blood-option ${
                          formData.bloodGroup === group ? "active" : ""
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            bloodGroup: group,
                          }))
                        }
                      >
                        {group}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="reg-form-group">
              <label htmlFor="address" className="reg-form-label">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="reg-form-textarea"
                placeholder="123 Main St, City, State"
                rows="3"
              />
            </div>

            <div className="reg-form-row">
              <div className="reg-form-group">
                <label htmlFor="city" className="reg-form-label">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="Mumbai"
                />
              </div>
              <div className="reg-form-group">
                <label htmlFor="district" className="reg-form-label">
                  District
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="Mumbai Suburban"
                />
              </div>
            </div>

            <div className="reg-form-row">
              <div className="reg-form-group">
                <label htmlFor="state" className="reg-form-label">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="Maharashtra"
                />
              </div>
              <div className="reg-form-group">
                <label htmlFor="country" className="reg-form-label">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="India"
                />
              </div>
            </div>

            <div className="reg-form-group">
              <label htmlFor="password" className="reg-form-label">
                Password
              </label>
              <div className="reg-password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="reg-form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="reg-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="reg-password-strength">
                <div
                  className={`reg-strength-bar ${
                    formData.password.length > 0 ? "active" : ""
                  } ${formData.password.length > 8 ? "strong" : ""}`}
                ></div>
                <span className="reg-strength-text">
                  {formData.password.length > 8
                    ? "Strong password"
                    : formData.password.length > 0
                    ? "Weak password"
                    : ""}
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="reg-submit-btn">
              {loading ? (
                <>
                  <span className="reg-spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="reg-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
