import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UpdateProfile.css";

const UpdateProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:8081/api/users/currentUser",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        setUser(response.data);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load profile");
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const authToken = localStorage.getItem("authToken");
      const payload = {
        ...formData,
        // Remove fields that shouldn't be updated
        password: undefined,
        role: undefined,
      };

      const response = await axios.put(
        "http://localhost:8081/api/users/updateUser",
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setSuccess("Profile updated successfully!");
      setUser(response.data.user);
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="update-profile-container py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="profile-card shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Update Profile</h2>
                <Badge pill bg="primary" className="mb-2">
                  {user?.role}
                </Badge>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>Personal Information</Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            required
                            disabled
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Mobile</Form.Label>
                          <Form.Control
                            type="tel"
                            name="mobile"
                            value={formData.mobile || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        {/* Show blood group only for Donors and Recipients */}
                        {(user?.role === "Donor" ||
                          user?.role === "Recipient") && (
                          <Form.Group className="mb-3">
                            <Form.Label>Blood Group</Form.Label>
                            <Form.Select
                              name="bloodGroup"
                              value={formData.bloodGroup || ""}
                              onChange={handleChange}
                            >
                              <option value="">Select Blood Group</option>
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                              ].map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        {user?.role === "Hospital" ||
                        user?.role === "Organization"
                          ? "Organization Details"
                          : "Additional Information"}
                      </Card.Header>
                      <Card.Body>
                        {/* Show registration number for Hospitals/Organizations */}
                        {(user?.role === "Hospital" ||
                          user?.role === "Organization") && (
                          <Form.Group className="mb-3">
                            <Form.Label>Registration Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="regNo"
                              value={formData.regNo || ""}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        )}

                        {/* Show personal details for Donors/Recipients/Admins */}
                        {(user?.role === "Donor" ||
                          user?.role === "Recipient" ||
                          user?.role === "Admin") && (
                          <>
                            <Form.Group className="mb-3">
                              <Form.Label>Gender</Form.Label>
                              <Form.Select
                                name="gender"
                                value={formData.gender || ""}
                                onChange={handleChange}
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Date of Birth</Form.Label>
                              <Form.Control
                                type="date"
                                name="dob"
                                value={
                                  formData.dob ? formData.dob.split("T")[0] : ""
                                }
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </>
                        )}

                        {/* Common fields for all roles */}
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                            rows={2}
                          />
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                name="city"
                                value={formData.city || ""}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>District</Form.Label>
                              <Form.Control
                                type="text"
                                name="district"
                                value={formData.district || ""}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>State</Form.Label>
                              <Form.Control
                                type="text"
                                name="state"
                                value={formData.state || ""}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Country</Form.Label>
                              <Form.Control
                                type="text"
                                name="country"
                                value={formData.country || ""}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/profile")}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Updating...</span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateProfile;
