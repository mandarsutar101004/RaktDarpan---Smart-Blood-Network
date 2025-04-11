import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CampRegistration.css";

const CampRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    campName: "",
    organizerName: "",
    organizerType: "",
    organizerContact: "",
    organizerEmail: "", // This will be populated after fetch
    inCollaborationWith: [],
    organizingDate: "",
    campStartTime: "",
    campEndTime: "",
    address: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    campDetails: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const organizerTypes = [
    "NGO",
    "Hospital",
    "Government",
    "Corporate",
    "Educational",
    "Other",
  ];

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:8081/api/users/currentUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the email from the response data
        setFormData((prev) => ({
          ...prev,
          organizerEmail: response.data.email || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Handle error (maybe redirect to login)
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCollaboratorsChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      inCollaborationWith: value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item)
        : [],
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.campName.trim()) newErrors.campName = "Camp name is required";
    if (!formData.organizerName.trim())
      newErrors.organizerName = "Organizer name is required";
    if (!formData.organizerType)
      newErrors.organizerType = "Organizer type is required";

    if (!formData.organizerContact.match(/^[0-9]{10,15}$/)) {
      newErrors.organizerContact = "Enter a valid 10-15 digit phone number";
    }

    if (!formData.organizerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.organizerEmail = "Enter a valid email address";
    }

    if (
      !formData.organizingDate ||
      new Date(formData.organizingDate) <= new Date()
    ) {
      newErrors.organizingDate = "Select a future date";
    }

    if (!formData.campStartTime)
      newErrors.campStartTime = "Start time is required";
    if (!formData.campEndTime) newErrors.campEndTime = "End time is required";

    if (
      formData.campStartTime &&
      formData.campEndTime &&
      formData.campEndTime.localeCompare(formData.campStartTime) <= 0
    ) {
      newErrors.campEndTime = "End time must be after start time";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:8081/api/camps/registerCamp",
        {
          ...formData,
          latitude: 0,
          longitude: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Camp registered successfully!");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error.response?.data);
      alert(error.response?.data.message || "Failed to register camp");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="camp-registration-container">Loading user data...</div>
    );
  }

  return (
    <div className="camp-registration-container blood-camp-form">
      <h2>Register New Blood Camp</h2>
      <form onSubmit={handleSubmit}>
        {/* Camp Information */}
        <div className="form-section">
          <h3>Camp Information</h3>
          <div className="form-group">
            <label>Camp Name*</label>
            <input
              type="text"
              name="campName"
              value={formData.campName}
              onChange={handleChange}
              maxLength="100"
            />
            {errors.campName && (
              <span className="error">{errors.campName}</span>
            )}
          </div>
        </div>

        {/* Organizer Details */}
        <div className="form-section">
          <h3>Organizer Details</h3>
          <div className="form-group">
            <label>Organizer Name*</label>
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
            />
            {errors.organizerName && (
              <span className="error">{errors.organizerName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Organizer Type*</label>
            <select
              name="organizerType"
              value={formData.organizerType}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              {organizerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.organizerType && (
              <span className="error">{errors.organizerType}</span>
            )}
          </div>

          <div className="form-group">
            <label>Contact Number*</label>
            <input
              type="tel"
              name="organizerContact"
              value={formData.organizerContact}
              onChange={handleChange}
              placeholder="10-15 digits"
            />
            {errors.organizerContact && (
              <span className="error">{errors.organizerContact}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              name="organizerEmail"
              value={formData.organizerEmail}
              onChange={handleChange}
              readOnly // Make the field read-only
              className="read-only-input" // Optional: Add style to indicate it's read-only
            />
            {errors.organizerEmail && (
              <span className="error">{errors.organizerEmail}</span>
            )}
          </div>

          <div className="form-group">
            <label>In Collaboration With (comma separated)</label>
            <input
              type="text"
              name="inCollaborationWith"
              value={formData.inCollaborationWith.join(", ")} // Now safe because we initialized as array
              onChange={handleCollaboratorsChange}
              placeholder="Organization 1, Organization 2"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="form-section">
          <h3>Date & Time</h3>
          <div className="form-group">
            <label>Date*</label>
            <input
              type="date"
              name="organizingDate"
              value={formData.organizingDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.organizingDate && (
              <span className="error">{errors.organizingDate}</span>
            )}
          </div>

          <div className="time-group">
            <div className="form-group">
              <label>Start Time*</label>
              <input
                type="time"
                name="campStartTime"
                value={formData.campStartTime}
                onChange={handleChange}
              />
              {errors.campStartTime && (
                <span className="error">{errors.campStartTime}</span>
              )}
            </div>

            <div className="form-group">
              <label>End Time*</label>
              <input
                type="time"
                name="campEndTime"
                value={formData.campEndTime}
                onChange={handleChange}
              />
              {errors.campEndTime && (
                <span className="error">{errors.campEndTime}</span>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label>Address*</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="location-group">
            <div className="form-group">
              <label>City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <span className="error">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State*</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              {errors.state && <span className="error">{errors.state}</span>}
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label>Camp Details</label>
            <textarea
              name="campDetails"
              value={formData.campDetails}
              onChange={handleChange}
              maxLength="500"
              rows="4"
            />
            <div className="char-count">{formData.campDetails.length}/500</div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Camp"}
        </button>
      </form>
    </div>
  );
};

export default CampRegistration;
