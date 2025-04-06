import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import "./Footer.css";
import ScrollLink from "./ScrollLink";

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("Thanks for subscribing!");
    e.target.reset();
  };

  return (
    <footer className="footer-section bg-dark text-white pt-5 pb-3">
      <Container>
        <Row className="g-4">
          {/* About Column */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">RaktDarpan</h5>
            <p>
              A life-saving platform connecting blood donors with recipients
              across India.
            </p>
            <div className="social-icons mt-4">
              <a href="#" className="social-icon">
                <FaFacebook />
              </a>
              <a href="#" className="social-icon">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon">
                <FaLinkedin />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">Quick Links</h5>
            <ul className="footer-links">
              <li>
                <ScrollLink to="about">About Us</ScrollLink>
              </li>
              <li>
                <a href="/donate">Donate Blood</a>
              </li>
              <li>
                <a href="/request-blood">Request Blood</a>
              </li>
              <li>
                <a href="/campaigns">Blood Donation Camps</a>
              </li>
              <li>
                <ScrollLink to="contact">Contact Us</ScrollLink>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">Contact Info</h5>
            <ul className="footer-contact">
              <li>
                <i className="me-2">
                  <FaMapMarkerAlt />
                </i>{" "}
                Mumbai, Maharashtra
              </li>
              <li>
                <a href="tel:+911234567890">
                  <i className="me-2">
                    <FaPhone />
                  </i>{" "}
                  +91 12345 67890
                </a>
              </li>
              <li>
                <a href="mailto:help@raktdarpan.com">
                  <i className="me-2">
                    <FaEnvelope />
                  </i>{" "}
                  help@raktdarpan.com
                </a>
              </li>
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading mb-4">Newsletter</h5>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your Email"
                  required
                />
              </div>
              <button type="submit" className="subscribe-btn w-100">
                Subscribe
              </button>
            </form>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="mt-5">
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} RaktDarpan. Made with{" "}
              <FaHeart color="#dc3545" /> in India
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
