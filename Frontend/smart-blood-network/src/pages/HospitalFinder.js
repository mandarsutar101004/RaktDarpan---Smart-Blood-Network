import React, { useState, useEffect } from "react";
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
import { FaSearch, FaPhone, FaUndo, FaHospital } from "react-icons/fa";
import "./HospitalFinder.css";

const HospitalFinder = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const hospitalsPerPage = 5;

  const API_URL = "http://localhost:8081/api/users/allHospitals";

  const fetchHospitals = async () => {
    try {
      const response = await axios.get(API_URL);
      setHospitals(response.data);
      setFilteredHospitals(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and reset to first page
  const applyFilters = () => {
    let result = [...hospitals];

    if (filters.city) {
      result = result.filter((hospital) =>
        hospital.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.state) {
      result = result.filter((hospital) =>
        hospital.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
    }

    setFilteredHospitals(result);
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
      city: "",
      state: "",
    });
    setFilteredHospitals(hospitals);
    setCurrentPage(1);
  };

  // Extract unique cities and states for dropdowns
  const cities = [
    ...new Set(hospitals.map((hospital) => hospital.city).filter(Boolean)),
  ].sort();
  const states = [
    ...new Set(hospitals.map((hospital) => hospital.state).filter(Boolean)),
  ].sort();

  // Pagination logic
  const indexOfLastHospital = currentPage * hospitalsPerPage;
  const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage;
  const currentHospitals = filteredHospitals.slice(
    indexOfFirstHospital,
    indexOfLastHospital
  );
  const totalPages = Math.ceil(filteredHospitals.length / hospitalsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading hospitals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-5">
        Error loading hospitals: {error}
        <Button variant="primary" onClick={fetchHospitals} className="mt-2">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <section className="hospital-finder-section py-5" id="findHospitals">
      <Container className="my-5">
        <h2 className="text-center mb-4" id="heading">
          Hospital Directory
        </h2>

        {/* Filter Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* City Filter */}
                <Col md={6}>
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
                <Col md={6}>
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

        {/* Hospitals Table */}
        {filteredHospitals.length > 0 ? (
          <>
            <Table
              striped
              bordered
              hover
              responsive
              className="hospital-table shadow-sm"
            >
              <thead className="table-dark">
                <tr>
                  <th>Hospital Name</th>
                  <th>Details</th>
                  <th>Contact</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {currentHospitals.map((hospital) => (
                  <tr key={hospital._id}>
                    <td className="align-middle">
                      <strong>{hospital.name}</strong>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <Badge bg="light" text="dark" className="me-2">
                          <FaHospital className="me-1" />
                          {hospital.type || "General"}
                        </Badge>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div>
                        <FaPhone className="me-2 text-primary" />
                        {hospital.contactNumber}
                      </div>
                      {hospital.email && (
                        <div className="small text-muted">{hospital.email}</div>
                      )}
                    </td>
                    <td className="align-middle">
                      {hospital.address && <div>{hospital.address}</div>}
                      <div>
                        {[hospital.city, hospital.state, hospital.country]
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
                  const endPage = Math.min(
                    startPage + pageLimit - 1,
                    totalPages
                  );

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
              Showing {indexOfFirstHospital + 1}-
              {Math.min(indexOfLastHospital, filteredHospitals.length)} of{" "}
              {filteredHospitals.length} hospitals
            </div>
          </>
        ) : (
          <Alert variant="info" className="text-center">
            No hospitals found matching your criteria
          </Alert>
        )}
      </Container>
    </section>
  );
};

export default HospitalFinder;
