import React, { useState, useEffect } from "react";
import {
  Table,
  Spinner,
  Form,
  Button,
  Badge,
  Card,
  Container,
  Alert,
  Modal,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [error, setError] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const API_BASE_URL = "http://localhost:8081/api/users";

  const roleEndpoints = {
    recipient: "allRecipients",
    donor: "allDonors",
    hospital: "allHospitals",
    organization: "allOrganizations",
  };

  const roleDisplayNames = {
    recipient: "Recipients",
    donor: "Donors",
    hospital: "Hospitals",
    organization: "Organizations",
  };

  useEffect(() => {
    if (selectedRole) {
      fetchUsers();
    } else {
      setUsers([]);
      setCurrentPage(1);
    }
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${API_BASE_URL}/${roleEndpoints[selectedRole]}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleEmailFilterChange = (e) => {
    setEmailFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setEmailFilter("");
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(emailFilter.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    return (
      <Badge
        pill
        bg={status === "active" ? "success" : "secondary"}
        className="status-badge"
      >
        {status || "inactive"}
      </Badge>
    );
  };

 // Enhanced block/unblock function with email focus
 const toggleUserBlockStatus = async (userId, email, isCurrentlyBlocked) => {
   setLoading(true);
   setError(null);

   try {
     const endpoint = isCurrentlyBlocked
       ? `${API_BASE_URL}/unblockUser`
       : `${API_BASE_URL}/blockUser`;

     const response = await fetch(endpoint, {
       method: "PUT",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${localStorage.getItem("token")}`,
       },
       body: JSON.stringify({ email }),
     });

     // First check if response is JSON
     const contentType = response.headers.get("content-type");
     if (!contentType || !contentType.includes("application/json")) {
       const text = await response.text();
       throw new Error(
         `Server returned ${response.status}: ${text.substring(0, 100)}...`
       );
     }

     const data = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || `Failed with status ${response.status}`);
     }

     // Update local state
     setUsers(
       users.map((user) =>
         user._id === userId
           ? { ...user, isBlocked: !isCurrentlyBlocked }
           : user
       )
     );

     // Show success feedback
     setAlertMessage(
       `User ${email} has been ${
         isCurrentlyBlocked ? "unblocked" : "blocked"
       } successfully`
     );
     setShowAlert(true);
     setTimeout(() => setShowAlert(false), 3000);
   } catch (err) {
     console.error("API Error:", err);

     // Handle different error cases
     let errorMessage = err.message;
     if (err.message.includes("<!DOCTYPE")) {
       errorMessage =
         "Server returned an error page. Please check the API endpoint.";
     } else if (err.message.includes("Failed to fetch")) {
       errorMessage =
         "Could not connect to the server. Please check your network.";
     }

     setError(
       `Failed to ${
         isCurrentlyBlocked ? "unblock" : "block"
       } user: ${errorMessage}`
     );
   } finally {
     setLoading(false);
   }
 };

  return (
    <Container className="user-management-container">
      {showAlert && (
        <Alert
          variant="success"
          onClose={() => setShowAlert(false)}
          dismissible
          className="position-fixed top-0 end-0 m-3"
          style={{ zIndex: 9999 }}
        >
          {alertMessage}
        </Alert>
      )}

      <h1 className="page-title">User Management</h1>

      <Card className="control-card">
        <Card.Body>
          <div className="filter-controls">
            <div className="role-selector">
              <Form.Group controlId="roleSelect">
                <Form.Label>Select User Role</Form.Label>
                <Form.Select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="role-dropdown"
                >
                  <option value="">-- Select Role --</option>
                  <option value="recipient">Recipients</option>
                  <option value="donor">Donors</option>
                  <option value="hospital">Hospitals</option>
                  <option value="organization">Organizations</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="email-filter">
              <Form.Group controlId="emailFilter">
                <Form.Label>Filter by Email</Form.Label>
                <div className="filter-input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search by email..."
                    value={emailFilter}
                    onChange={handleEmailFilterChange}
                    className="email-input"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={clearFilters}
                    className="clear-btn"
                  >
                    <i className="bi bi-x-lg"></i> Clear
                  </Button>
                </div>
              </Form.Group>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="data-card">
        <Card.Header className="data-header">
          <h5>
            {selectedRole ? (
              <>
                <span className="role-title">
                  {roleDisplayNames[selectedRole]}
                </span>
                {loading && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="loading-spinner"
                  />
                )}
              </>
            ) : (
              <span className="prompt-message">
                Select a user role to display data
              </span>
            )}
          </h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="error-alert">
              <i className="bi bi-exclamation-triangle-fill"></i> Error loading
              data: {error}
            </Alert>
          )}

          <div className="table-container">
            <Table striped bordered hover responsive className="users-table">
              <thead>
                <tr>
                  <th className="id-column">ID</th>
                  <th className="name-column">Name</th>
                  <th className="email-column">Email</th>
                  <th className="phone-column">Phone</th>
                  <th className="status-column">Status</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="loading-row">
                      <Spinner animation="border" className="center-spinner" />
                    </td>
                  </tr>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`user-row ${
                        hoveredRow === user.id ? "hovered" : ""
                      }`}
                      onMouseEnter={() => setHoveredRow(user.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="id-cell">{user._id}</td>
                      <td className="name-cell">{user.name}</td>
                      <td className="email-cell">{user.email}</td>
                      <td className="phone-cell">
                        {user.phone || user.mobile}
                      </td>
                      <td className="status-cell">
                        <Badge
                          pill
                          bg={user.isBlocked ? "danger" : "success"}
                          className="status-badge"
                        >
                          {user.isBlocked ? "Blocked" : "Unblocked"}
                        </Badge>
                      </td>
                      <td className="actions-cell">
                        <Button
                          variant="primary"
                          size="sm"
                          className="action-btn view-btn me-2"
                          onClick={() => viewUserDetails(user)}
                        >
                          <i className="bi bi-eye-fill"></i> View
                        </Button>
                        <Button
                          variant={user.isBlocked ? "success" : "danger"}
                          size="sm"
                          className="action-btn block-btn"
                          onClick={() =>
                            toggleUserBlockStatus(
                              user._id,
                              user.email,
                              user.isBlocked
                            )
                          }
                          disabled={loading}
                        >
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <i
                                className={`bi ${
                                  user.isBlocked
                                    ? "bi-check-circle"
                                    : "bi-slash-circle"
                                }`}
                              ></i>
                              {user.isBlocked ? " Unblock" : " Block"}
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data-row">
                      {selectedRole
                        ? "No users found matching your criteria"
                        : "Please select a role to view users"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {filteredUsers.length > 0 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} entries
              </div>

              <Pagination className="custom-pagination">
                <Pagination.First
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                />

                {/* Always show first page */}
                <Pagination.Item
                  active={1 === currentPage}
                  onClick={() => paginate(1)}
                >
                  1
                </Pagination.Item>

                {/* Show ellipsis if needed */}
                {currentPage > 3 && <Pagination.Ellipsis disabled />}

                {/* Show current page and neighbors */}
                {currentPage > 2 && (
                  <Pagination.Item onClick={() => paginate(currentPage - 1)}>
                    {currentPage - 1}
                  </Pagination.Item>
                )}
                {currentPage !== 1 && currentPage !== totalPages && (
                  <Pagination.Item active>{currentPage}</Pagination.Item>
                )}
                {currentPage < totalPages - 1 && (
                  <Pagination.Item onClick={() => paginate(currentPage + 1)}>
                    {currentPage + 1}
                  </Pagination.Item>
                )}

                {/* Show ellipsis if needed */}
                {currentPage < totalPages - 2 && (
                  <Pagination.Ellipsis disabled />
                )}

                {/* Always show last page if different from first */}
                {totalPages > 1 && (
                  <Pagination.Item
                    active={totalPages === currentPage}
                    onClick={() => paginate(totalPages)}
                  >
                    {totalPages}
                  </Pagination.Item>
                )}

                <Pagination.Next
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal
        show={showUserDetails}
        onHide={closeUserDetails}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="user-details-container">
              <Row>
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedUser.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedUser.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{selectedUser.role}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Designation:</span>
                    <span className="detail-value">
                      {selectedUser.designation}
                    </span>
                  </div>
                  {selectedUser.gender && (
                    <div className="detail-item">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">
                        {selectedUser.gender}
                      </span>
                    </div>
                  )}
                  {selectedUser.dob && (
                    <div className="detail-item">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">
                        {formatDate(selectedUser.dob)}
                      </span>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {selectedUser.phone || selectedUser.mobile}
                    </span>
                  </div>
                  {selectedUser.bloodGroup && (
                    <div className="detail-item">
                      <span className="detail-label">Blood Group:</span>
                      <span className="detail-value">
                        {selectedUser.bloodGroup}
                      </span>
                    </div>
                  )}
                  {selectedUser.regNo && (
                    <div className="detail-item">
                      <span className="detail-label">Registration No:</span>
                      <span className="detail-value">{selectedUser.regNo}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(selectedUser.isBlocked ? "Blocked" : "Active")}
                    </span>
                  </div>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedUser.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City:</span>
                    <span className="detail-value">{selectedUser.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">District:</span>
                    <span className="detail-value">
                      {selectedUser.district}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">State:</span>
                    <span className="detail-value">{selectedUser.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Country:</span>
                    <span className="detail-value">{selectedUser.country}</span>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeUserDetails}>
            Back
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
