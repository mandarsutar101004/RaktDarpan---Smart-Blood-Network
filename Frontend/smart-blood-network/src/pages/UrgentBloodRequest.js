import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UrgentBloodRequest.css";
import ContactDonor from "./ContactDonor";
import { useNavigate } from "react-router-dom";

const UrgentBloodRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    recipientEmail: "",
    bloodGroup: "",
    address: "",
    city: "",
    district: "",
    state: "",
    country: "",
    contact: "",
    hospitalName: "",
    requiredDate: "",
    gender: "",
    age: "",
  });

  const [donors, setDonors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const gender = ["Male", "Female", "Others"];
  const [contactedDonors, setContactedDonors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const geocodeAddress = async () => {
    try {
      const addressString = [
        formData.address,
        formData.district,
        formData.city,
        formData.state,
        formData.country,
      ]
        .filter(Boolean)
        .join(", ");

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addressString
        )}`,
        {
          headers: { "User-Agent": "BloodDonationApp" },
          params: { limit: 1 },
        }
      );

      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
          formattedAddress: response.data[0].display_name,
        };
      }
      throw new Error("No coordinates found for this address");
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error(
        "Could not determine location coordinates. Using default values."
      );
      return {
        latitude: 19.076, // Default Mumbai coordinates
        longitude: 72.8777,
        formattedAddress: `${formData.city}, ${formData.state}, ${formData.country}`,
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.recipientName ||
        !formData.recipientEmail ||
        !formData.bloodGroup ||
        !formData.city ||
        !formData.district ||
        !formData.state ||
        !formData.country ||
        !formData.contact ||
        !formData.hospitalName ||
        !formData.requiredDate ||
        !formData.age ||
        !formData.address ||
        !formData.gender
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // Get coordinates from address
      const { latitude, longitude, formattedAddress } = await geocodeAddress();
      console.log("Geocoded coordinates:", {
        latitude,
        longitude,
        formattedAddress,
      });

      // Prepare API payload
      const payload = {
        latitude,
        longitude,
        bloodGroup: formData.bloodGroup,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        location: formattedAddress,
        contact: formData.contact,
        hospitalName: formData.hospitalName,
        address: formData.address,
        requiredDate: formData.requiredDate,
        age: formData.age,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        gender: formData.gender,
      };

      console.log("Sending to API:", payload);
      const response = await axios.post(
        "http://localhost:8081/api/users/matchDonors",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("API Response:", response.data);
      setApiResponse(response.data);

      if (response.data.nearestDonors?.length > 0) {
        setDonors(response.data.nearestDonors);
        toast.success(
          `Found ${response.data.nearestDonors.length} donors nearby!`
        );
      } else {
        setDonors([]);
        toast.info(response.data.message || "No matching donors found nearby");
      }
    } catch (error) {
      console.error("Submission error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
      toast.error(error.response?.data?.message || "Failed to submit request");
      setDonors([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="urgent-blood-request-container">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-danger mb-3 back-button"
      >
        <i className="bi bi-arrow-left me-2"></i> Back
      </button>

      <div className="card shadow blood-request-card">
        <div className="card-header blood-request-header">
          <h2 className="mb-0">Urgent Blood Request</h2>
          <p className="mb-0">We'll find donors near your location</p>
        </div>

        <div className="card-body">
          {donors.length === 0 ? (
            <form onSubmit={handleSubmit} className="blood-request-form">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label blood-request-label">
                    Patient Name*
                  </label>
                  <input
                    type="text"
                    className="form-control blood-request-input"
                    name="recipientName"
                    placeholder="Patient Name"
                    value={formData.recipientName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label blood-request-label">
                    Patient Email*
                  </label>
                  <input
                    type="email"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Please enter a valid email address"
                    className="form-control blood-request-input"
                    name="recipientEmail"
                    placeholder="example@gmail.com"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label blood-request-label">
                    Blood Group Needed*
                  </label>
                  <select
                    className="form-select blood-request-input"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label
                    htmlFor="gender"
                    className="form-label blood-request-label"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="form-select blood-request-input"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {gender.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label blood-request-label">Age</label>
                  <input
                    type="number"
                    className="form-control blood-request-input"
                    name="age"
                    placeholder="Enter Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label blood-request-label">
                    Contact No.
                  </label>
                  <input
                    type="number"
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="form-control blood-request-input"
                    name="contact"
                    placeholder="0123456789"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label blood-request-label">
                    Blood Required Date
                  </label>
                  <input
                    type="date"
                    className="form-control blood-request-input"
                    name="requiredDate"
                    value={formData.requiredDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label blood-request-label">
                  Hospital Name
                </label>
                <input
                  type="text"
                  className="form-control blood-request-input"
                  name="hospitalName"
                  placeholder="abc Hospital"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label blood-request-label">
                  Hospital Address
                </label>
                <textarea
                  className="form-control blood-request-input"
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat number, Street, Area"
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label blood-request-label">
                    City*
                  </label>
                  <input
                    type="text"
                    className="form-control blood-request-input"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label blood-request-label">
                    District*
                  </label>
                  <input
                    type="text"
                    className="form-control blood-request-input"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label blood-request-label">
                    State*
                  </label>
                  <input
                    type="text"
                    className="form-control blood-request-input"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label blood-request-label">
                  Country*
                </label>
                <input
                  type="text"
                  className="form-control blood-request-input"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="btn btn-danger px-4 py-2 blood-request-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Locating Donors...
                    </>
                  ) : (
                    "Find Nearby Donors"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="donor-results">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="mb-1">
                    <span className="badge bg-danger me-2 blood-request-badge">
                      {donors.length}
                    </span>
                    Available Donors
                  </h4>
                  <p className="text-muted small mb-0">
                    Near {apiResponse?.location || formData.city}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setDonors([])}
                >
                  <i className="bi bi-arrow-left me-1"></i> New Search
                </button>
              </div>

              {donors.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {donors.map((donor, index) => (
                    <div key={index} className="col">
                      <div className="card h-100 border-0 shadow-sm blood-request-donor-card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">{donor.name}</h5>
                          <span className="badge bg-danger blood-request-badge">
                            {donor.bloodGroup}
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <i className="bi bi-geo-alt-fill text-danger me-3 fs-5"></i>
                            <div>
                              <div>{donor.address}</div>
                              <small className="text-muted">
                                {donor.city}, {donor.district}, {donor.state}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center mb-3">
                            <i className="bi bi-telephone-fill text-danger me-3 fs-5"></i>
                            <span>{donor.mobile}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-envelope-fill text-danger me-3 fs-5"></i>
                            <span>{donor.email}</span>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent">
                          <ContactDonor
                            donor={donor}
                            requestData={{
                              recipientName: formData.recipientName,
                              recipientEmail: formData.recipientEmail,
                              bloodGroup: formData.bloodGroup,
                              gender: formData.gender,
                              hospitalName: formData.hospitalName,
                              city: formData.city,
                              state: formData.state,
                              country: formData.country,
                              contact: formData.contact,
                              location: apiResponse?.location,
                              age: formData.patientAge,
                              requiredDate: formData.requiredDate,
                              address: formData.address,
                              district: formData.district,
                            }}
                            onContactSuccess={(donor) => {
                              if (!contactedDonors.includes(donor.id)) {
                                setContactedDonors([
                                  ...contactedDonors,
                                  donor.id,
                                ]);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="alert alert-warning">
                    {apiResponse?.message || "No donors found in your area"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};

export default UrgentBloodRequest;
