import { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
import "./Contact.css";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent successfully!");
    console.log("Form data:", formData);
    // Add your API call here using axios
    setFormData({ name: "", email: "", message: "" });
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
          {/* <p className="text-center mb-5 contact-subtitle">
            We're here to help you 24/7
          </p> */}

          <Row className="g-4 mb-5">
            {/* Phone Card */}
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

            {/* Email Card */}
            <Col md={4}>
              <div className="contact-card h-100">
                <div className="contact-icon">
                  <FaEnvelope size={28} />
                </div>
                <h3>Email Us</h3>
                <p>Response within 24 hours</p>
                <a href="mailto:raktdarpan2024@gmail.com" className="contact-link">
                  raktdarpan2024@gmail.com
                </a>
              </div>
            </Col>

            {/* Location Card */}
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

          {/* Contact Form */}
          <Row className="justify-content-center">
            <Col lg={8}>
              <form onSubmit={handleSubmit} className="contact-form">
                <h3 className="text-center mb-4">Send Us a Message</h3>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    className="form-control"
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn w-100">
                  <FaPaperPlane className="me-2" />
                  Send Message
                </button>
              </form>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
