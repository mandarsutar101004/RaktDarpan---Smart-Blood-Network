import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Form,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import {
  FaSearch,
  FaPhone,
  FaUndo,
  FaVenusMars,
  FaBirthdayCake,
} from "react-icons/fa";
import "./DonorFinder.css";

const DonorFinder = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    bloodGroup: "",
    city: "",
    state: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 5;

  const API_URL = "http://localhost:8081/api/users/allDonors";

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const fetchDonors = async () => {
    try {
      const response = await axios.get(API_URL);
      setDonors(response.data);
      setFilteredDonors(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and reset to first page
  const applyFilters = () => {
    let result = [...donors];

    if (filters.bloodGroup) {
      result = result.filter(
        (donor) => donor.bloodGroup === filters.bloodGroup
      );
    }

    if (filters.city) {
      result = result.filter((donor) =>
        donor.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.state) {
      result = result.filter((donor) =>
        donor.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
    }

    setFilteredDonors(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const resetFilters = () => {
    setFilters({
      bloodGroup: "",
      city: "",
      state: "",
    });
    setFilteredDonors(donors);
    setCurrentPage(1);
  };

  const calculateAge = (dob) => {
    if (!dob) return "Unknown";
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Extract unique cities and states for dropdowns
  const cities = [
    ...new Set(donors.map((donor) => donor.city).filter(Boolean)),
  ].sort();
  const states = [
    ...new Set(donors.map((donor) => donor.state).filter(Boolean)),
  ].sort();

  // Pagination logic
  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = filteredDonors.slice(
    indexOfFirstDonor,
    indexOfLastDonor
  );
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchDonors();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading donors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-5">
        Error loading donors: {error}
        <Button variant="primary" onClick={fetchDonors} className="mt-2">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Container className="my-5" id="findDonors">
      <h2 className="text-center mb-4" id="heading">
        Blood Donors
      </h2>

      {/* Filter Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Blood Group Filter */}
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    name="bloodGroup"
                    value={filters.bloodGroup}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Blood Groups</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* City Filter */}
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    as="select"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              {/* State Filter */}
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    as="select"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                  >
                    <option value="">All States</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col className="d-flex justify-content-end">
                <Button variant="primary" type="submit" className="me-2">
                  <FaSearch className="me-2" />
                  Apply Filters
                </Button>
                <Button variant="secondary" onClick={resetFilters}>
                  <FaUndo className="me-2" />
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Donors Table */}
      {filteredDonors.length > 0 ? (
        <>
          <Table
            striped
            bordered
            hover
            responsive
            className="donor-table shadow-sm"
          >
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Details</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {currentDonors.map((donor) => (
                <tr key={donor._id}>
                  <td className="align-middle">
                    <strong>{donor.name}</strong>
                  </td>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <Badge bg="light" text="dark" className="me-2">
                        <FaVenusMars className="me-1" />
                        {donor.gender}
                      </Badge>
                      <Badge bg="light" text="dark">
                        <FaBirthdayCake className="me-1" />
                        {calculateAge(donor.dob)} yrs
                      </Badge>
                    </div>
                  </td>
                  <td className="align-middle">
                    <Badge bg="danger" className="fs-6">
                      {donor.bloodGroup}
                    </Badge>
                  </td>
                  <td className="align-middle">
                    <div>
                      <FaPhone className="me-2 text-primary" />
                      {donor.mobile}
                    </div>
                    <div className="small text-muted">{donor.email}</div>
                  </td>
                  <td className="align-middle">
                    {donor.address && <div>{donor.address}</div>}
                    <div>
                      {[donor.city, donor.district, donor.state, donor.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.First
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {(() => {
                const pageLimit = 10;
                const startPage =
                  Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
                const endPage = Math.min(startPage + pageLimit - 1, totalPages);

                return Array.from(
                  { length: endPage - startPage + 1 },
                  (_, i) => startPage + i
                ).map((number) => (
                  <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </Pagination.Item>
                ));
              })()}

              <Pagination.Next
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>

          <div className="text-center text-muted mt-2">
            Showing {indexOfFirstDonor + 1}-
            {Math.min(indexOfLastDonor, filteredDonors.length)} of{" "}
            {filteredDonors.length} donors
          </div>
        </>
      ) : (
        <Alert variant="info" className="text-center">
          No donors found matching your criteria
        </Alert>
      )}
    </Container>
  );
};

export default DonorFinder;
