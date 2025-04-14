import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CampManagement.css";

const CampManagement = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentCamp, setCurrentCamp] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [campToDelete, setCampToDelete] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Form state for update
  const [formData, setFormData] = useState({
    _id: "",
    campName: "",
    organizerName: "",
    organizerType: "",
    organizerContact: "",
    organizerEmail: "",
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

  const organizerTypes = [
    "NGO",
    "Hospital",
    "Government",
    "Corporate",
    "Educational",
    "Other",
  ];

  // Fetch current user's camps with retry logic
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Get current user email
        const userResponse = await axios.get(
          "http://localhost:8081/api/users/currentUser",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );

        const userEmail =
          userResponse.data?.email || userResponse.data?.data?.email;
        if (!userEmail) {
          throw new Error("Could not get user email");
        }

        // Get all camps and filter by organizer email
        const campsResponse = await axios.get(
          "http://localhost:8081/api/camps/allCamps",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );

        // Handle different response structures
        let allCamps = [];
        if (Array.isArray(campsResponse.data)) {
          allCamps = campsResponse.data;
        } else if (campsResponse.data?.camps) {
          allCamps = campsResponse.data.camps;
        } else if (campsResponse.data?.data) {
          allCamps = campsResponse.data.data;
        }

        const filteredCamps = allCamps.filter(
          (camp) => camp.organizerEmail === userEmail
        );

        setCamps(filteredCamps);
      } catch (err) {
        console.error("Fetch error details:", err);

        if (retryCount < 2) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          setRetryCount(retryCount + 1);
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch camps data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, [retryCount]);

  // Handle update form changes
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

  // Open update form with camp data
  const handleUpdateClick = (camp) => {
    setCurrentCamp(camp);
    setFormData({
      _id: camp._id,
      campName: camp.campName,
      organizerName: camp.organizerName,
      organizerType: camp.organizerType,
      organizerContact: camp.organizerContact,
      organizerEmail: camp.organizerEmail,
      inCollaborationWith: camp.inCollaborationWith || [],
      organizingDate: new Date(camp.organizingDate).toISOString().split("T")[0],
      campStartTime: camp.campStartTime,
      campEndTime: camp.campEndTime,
      address: camp.address,
      city: camp.city,
      district: camp.district,
      state: camp.state,
      country: camp.country || "India",
      campDetails: camp.campDetails || "",
    });
    setShowUpdateForm(true);
  };

  // Submit updated camp data
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      await axios.put("http://localhost:8081/api/camps/updateCamp", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Refresh camps list
      const updatedCamps = camps.map((camp) =>
        camp._id === formData._id ? { ...camp, ...formData } : camp
      );
      setCamps(updatedCamps);
      setShowUpdateForm(false);
      alert("Camp updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Failed to update camp");
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (camp) => {
    setCampToDelete(camp);
    setShowDeleteConfirm(true);
  };

  // Render camp details in expanded view
  const renderCampDetails = (camp) => {
    return (
      <div className="camp-details-expanded">
        <h4>Camp Details</h4>
        <p>{camp.campDetails}</p>

        <div className="details-grid">
          <div className="detail-item">
            <strong>Organizer:</strong> {camp.organizerName} (
            {camp.organizerType})
          </div>
          <div className="detail-item">
            <strong>Contact:</strong> {camp.organizerContact}
          </div>
          <div className="detail-item">
            <strong>Email:</strong> {camp.organizerEmail}
          </div>
          {camp.inCollaborationWith?.length > 0 && (
            <div className="detail-item">
              <strong>Collaborators:</strong>{" "}
              {camp.inCollaborationWith.join(", ")}
            </div>
          )}
          <div className="detail-item">
            <strong>Time:</strong> {camp.campStartTime} - {camp.campEndTime}
          </div>
          <div className="detail-item">
            <strong>Location:</strong> {camp.address}, {camp.city},{" "}
            {camp.district}, {camp.state}, {camp.country}
          </div>
        </div>
      </div>
    );
  };


  // Confirm and delete camp
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete("http://localhost:8081/api/camps/deleteCamp", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { _id: campToDelete._id },
      });

      // Remove from local state
      setCamps(camps.filter((camp) => camp._id !== campToDelete._id));
      setShowDeleteConfirm(false);
      alert("Camp deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete camp");
    }
  };

  if (loading) {
    return (
      <div className="camp-management-container">
        <div className="loading-spinner"></div>
        <p>Loading camps data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camp-management-container error-state">
        <h3>Error Loading Camps</h3>
        <p>{error}</p>
        <button
          onClick={() => {
            setRetryCount(0);
            setLoading(true);
            setError("");
          }}
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="camp-management-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>
      <h2>Manage Your Blood Donation Camps</h2>

      {camps.length === 0 ? (
        <p className="no-camps-message">
          No camps found for your organization. Would you like to create one?
        </p>
      ) : (
        <div className="table-responsive">
          <table className="camps-table">
            <thead>
              <tr>
                <th>Camp Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {camps.map((camp) => (
                <tr key={camp._id}>
                  <td>{camp.campName}</td>
                  <td>
                    {new Date(camp.organizingDate).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    {camp.city}, {camp.district}
                  </td>
                  <td className="details-cell">
                    <details>
                      <summary>View Details</summary>
                      {renderCampDetails(camp)}
                    </details>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleUpdateClick(camp)}
                      className="update-btn"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteClick(camp)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Form Modal */}
      {showUpdateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Camp Details</h3>
            <form onSubmit={handleUpdateSubmit}>
              {/* Camp Information */}
              <div className="form-section">
                <h4>Camp Information</h4>
                <div className="form-group">
                  <label>Camp Name*</label>
                  <input
                    type="text"
                    name="campName"
                    value={formData.campName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Organizer Details */}
              <div className="form-section">
                <h4>Organizer Details</h4>
                <div className="form-group">
                  <label>Organizer Name*</label>
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Organizer Type*</label>
                  <select
                    name="organizerType"
                    value={formData.organizerType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    {organizerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Number*</label>
                  <input
                    type="tel"
                    name="organizerContact"
                    value={formData.organizerContact}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email*</label>
                  <input
                    type="email"
                    name="organizerEmail"
                    value={formData.organizerEmail}
                    onChange={handleChange}
                    readOnly
                    className="read-only-input"
                  />
                </div>

                <div className="form-group">
                  <label>In Collaboration With (comma separated)</label>
                  <input
                    type="text"
                    name="inCollaborationWith"
                    value={formData.inCollaborationWith.join(", ")}
                    onChange={handleCollaboratorsChange}
                    placeholder="Organization 1, Organization 2"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="form-section">
                <h4>Date & Time</h4>
                <div className="form-group">
                  <label>Date*</label>
                  <input
                    type="date"
                    name="organizingDate"
                    value={formData.organizingDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="time-group">
                  <div className="form-group">
                    <label>Start Time*</label>
                    <input
                      type="time"
                      name="campStartTime"
                      value={formData.campStartTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time*</label>
                    <input
                      type="time"
                      name="campEndTime"
                      value={formData.campEndTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <h4>Location</h4>
                <div className="form-group">
                  <label>Address*</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="location-group">
                  <div className="form-group">
                    <label>City*</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State*</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="form-section">
                <h4>Additional Information</h4>
                <div className="form-group">
                  <label>Camp Details</label>
                  <textarea
                    name="campDetails"
                    value={formData.campDetails}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the camp "{campToDelete?.campName}
              " on {new Date(campToDelete?.organizingDate).toLocaleDateString()}
              ?
            </p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampManagement;
