import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Spinner,
  Alert,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

      if (!response.data?._id) {
        throw new Error("Invalid user data received");
      }

      setUser(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = () => {
    navigate("/update-profile");
  };

  if (loading) {
    return (
      <div className="profile-background">
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <Spinner animation="border" variant="primary" />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-background">
        <Container className="profile-container">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Profile</Alert.Heading>
            <p>{error}</p>
            <Button variant="primary" onClick={fetchUserData}>
              Try Again
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-background">
      <Container className="profile-container">
        <Row className="justify-content-center">
          <Col xl={8} xxl={7}>
            <Card className="profile-card">
              <div className="profile-cover">
                <Button
                  variant="light"
                  className="update-profile-btn"
                  onClick={handleUpdateProfile}
                >
                  Update Profile
                </Button>
              </div>

              <div className="profile-header text-center">
                <div className="avatar-wrapper">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=200`}
                    className="profile-avatar"
                    alt="Profile"
                    roundedCircle
                  />
                </div>
                <h1 className="profile-name">{user.name}</h1>
                <div className="profile-meta">
                  <Badge pill bg="primary" className="me-2">
                    {user.role}
                  </Badge>
                  {user.bloodGroup && (
                    <Badge pill bg="danger">
                      {user.bloodGroup}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="profile-body">
                <Row>
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        {user.role === "Hospital" ? (
                          <i className="fas fa-hospital me-2"></i>
                        ) : user.role === "Organization" ? (
                          <i className="fas fa-sitemap me-2"></i>
                        ) : (
                          <i className="fas fa-user me-2"></i>
                        )}
                        {user.role === "Hospital"
                          ? "Hospital Information"
                          : user.role === "Organization"
                          ? "Organization Information"
                          : "Personal Information"}
                      </Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <strong>Name:</strong> {user.name}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Email:</strong> {user.email}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Mobile:</strong>{" "}
                            {user.mobile || "Not provided"}
                          </ListGroup.Item>
                          {(user.role === "Donor" ||
                            user.role === "Recipient" ||
                            user.role === "Admin") && (
                            <>
                              <ListGroup.Item>
                                <strong>Blood Group:</strong>{" "}
                                {user.bloodGroup || "Not specified"}
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <strong>Gender:</strong>{" "}
                                {user.gender || "Not specified"}
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <strong>Date of Birth:</strong>{" "}
                                {user.dob
                                  ? new Date(user.dob).toLocaleDateString()
                                  : "Not specified"}
                              </ListGroup.Item>
                            </>
                          )}
                          {(user.role === "Hospital" ||
                            user.role === "Organization") && (
                            <ListGroup.Item>
                              <strong>Registration No:</strong>{" "}
                              {user.regNo || "Not provided"}
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        <i className="fas fa-info-circle me-2"></i>
                        Additional Information
                      </Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <strong>Address:</strong>{" "}
                            {user.address || "Not specified"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>City:</strong>{" "}
                            {user.city || "Not specified"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>District:</strong>{" "}
                            {user.district || "Not specified"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>State:</strong>{" "}
                            {user.state || "Not specified"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Country:</strong>{" "}
                            {user.country || "Not specified"}
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;
