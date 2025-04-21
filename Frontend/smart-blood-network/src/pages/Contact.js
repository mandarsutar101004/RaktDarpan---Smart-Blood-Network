import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheck,
} from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Listen for logout events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "authToken" && !e.newValue) {
        handleLogout();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check auth status on mount and when authToken changes
  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        handleLogout();
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8081/api/users/currentUser",
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        if (response.data?.email) {
          setIsAuthenticated(true);
          setFormData({
            name: response.data.name || "",
            email: response.data.email,
            message: "",
          });
        }
      } catch (error) {
        handleLogout();
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warning("Please login to send feedback");
      navigate("/login");
      return;
    }

    if (!formData.message.trim()) {
      toast.warning("Please enter your message");
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const authToken = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:8081/api/notifications/sendFeedback",
        { message: formData.message },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      toast.success("Feedback sent successfully!");
      setIsSuccess(true);
      setFormData((prev) => ({ ...prev, message: "" }));

      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error(error.response?.data?.message || "Failed to send feedback");

      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        handleLogout();
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container fluid className="contact-section py-5" id="contact">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <h2 className="text-center mb-4">Get In Touch</h2>

          {/* ... (rest of your contact cards remain the same) ... */}
          <Row className="g-4 mb-5">
            <Col md={4}>
              <div className="contact-card h-100">
                <div className="contact-icon">
                  <FaPhone size={28} />
                </div>
                <h3>Emergency Helpline</h3>
                <p>Available 24 hours</p>
                <a href="tel:+911234567890" className="contact-link">
                  +91 12345 67890
                </a>
              </div>
            </Col>

            <Col md={4}>
              <div className="contact-card h-100">
                <div className="contact-icon">
                  <FaEnvelope size={28} />
                </div>
                <h3>Email Us</h3>
                <p>Response within 24 hours</p>
                <a
                  href="mailto:raktdarpan2024@gmail.com"
                  className="contact-link"
                >
                  raktdarpan2024@gmail.com
                </a>
              </div>
            </Col>

            <Col md={4}>
              <div className="contact-card h-100">
                <div className="contact-icon">
                  <FaMapMarkerAlt size={28} />
                </div>
                <h3>Our Location</h3>
                <p>Mumbai, Maharashtra</p>
                <a
                  href="https://maps.google.com?q=RaktDarpan+Mumbai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  View on Map
                </a>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={8}>
              <form onSubmit={handleSubmit} className="contact-form">
                <h3 className="text-center mb-4">Send Us a Message</h3>

                {isSuccess && (
                  <div className="alert alert-success d-flex align-items-center">
                    <FaCheck className="me-2" />
                    <div>Your feedback has been sent successfully!</div>
                  </div>
                )}

                <div className="mb-3">
                  <label>Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isAuthenticated}
                  />
                </div>

                <div className="mb-3">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    readOnly={isAuthenticated}
                  />
                </div>

                <div className="mb-4">
                  <label>Your Message</label>
                  <textarea
                    className="form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-btn w-100"
                  disabled={isLoading || !isAuthenticated}
                >
                  {isLoading ? (
                    <span className="d-flex align-items-center justify-content-center">
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" />
                      Send Feedback
                    </>
                  )}
                </button>

                {!isAuthenticated && (
                  <div className="alert alert-warning mt-3 d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>Please login to send feedback</div>
                  </div>
                )}
              </form>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
