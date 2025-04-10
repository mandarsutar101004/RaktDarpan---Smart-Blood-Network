import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LiveCamps.css";

const LiveCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const campsPerPage = 5;

  // Calculate today's date and 1 month from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);
  oneMonthLater.setHours(23, 59, 59, 999);

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [dateRange, setDateRange] = useState({
    start: formatDateForInput(today),
    end: formatDateForInput(oneMonthLater),
  });
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/camps/allCamps"
        );
        if (response.data.success) {
          const futureCamps = response.data.data.filter((camp) => {
            const campDate = new Date(camp.organizingDate);
            return campDate >= today && campDate <= oneMonthLater;
          });
          setCamps(futureCamps);
        } else {
          setError("Failed to fetch camps");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  const filterByDateRange = (camp) => {
    const campDate = new Date(camp.organizingDate);
    const startDate = dateRange.start ? new Date(dateRange.start) : today;
    const endDate = dateRange.end ? new Date(dateRange.end) : oneMonthLater;
    return campDate >= startDate && campDate <= endDate;
  };

  const filterByCity = (camp) => {
    if (!cityFilter) return true;
    return camp.city.toLowerCase().includes(cityFilter.toLowerCase());
  };

  const filterByState = (camp) => {
    if (!stateFilter) return true;
    return camp.state.toLowerCase().includes(stateFilter.toLowerCase());
  };

  const filteredCamps = camps
    .filter(filterByDateRange)
    .filter(filterByCity)
    .filter(filterByState);

  const indexOfLastCamp = currentPage * campsPerPage;
  const indexOfFirstCamp = indexOfLastCamp - campsPerPage;
  const currentCamps = filteredCamps.slice(indexOfFirstCamp, indexOfLastCamp);
  const totalPages = Math.ceil(filteredCamps.length / campsPerPage);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDetailsClick = (camp) => {
    setSelectedCamp(camp);
  };

  const closeDetails = () => {
    setSelectedCamp(null);
  };

  const resetFilters = () => {
    setDateRange({
      start: formatDateForInput(today),
      end: formatDateForInput(oneMonthLater),
    });
    setCityFilter("");
    setStateFilter("");
    setCurrentPage(1);
  };

  if (loading)
    return <div className="live-camps-loading">Loading camps...</div>;
  if (error) return <div className="live-camps-error">Error: {error}</div>;

  return (
    <div className="live-camps-container">
      <h2 className="live-camps-title">Upcoming Blood Donation Camps</h2>

      {/* Filters Section */}
      <div className="live-camps-filters-section">
        <div className="live-camps-filter-group">
          <label className="live-camps-filter-label">Date Range:</label>
          <div className="live-camps-date-inputs">
            <input
              type="date"
              className="live-camps-filter-input"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              min={formatDateForInput(today)}
              max={dateRange.end || formatDateForInput(oneMonthLater)}
            />
            <span className="live-camps-date-span">to</span>
            <input
              type="date"
              className="live-camps-filter-input"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              min={dateRange.start || formatDateForInput(today)}
              max={formatDateForInput(oneMonthLater)}
            />
          </div>
        </div>

        <div className="live-camps-filter-group">
          <label className="live-camps-filter-label">City:</label>
          <input
            type="text"
            className="live-camps-filter-input"
            placeholder="Filter by city"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>

        <div className="live-camps-filter-group">
          <label className="live-camps-filter-label">State:</label>
          <input
            type="text"
            className="live-camps-filter-input"
            placeholder="Filter by state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          />
        </div>

        <button className="live-camps-reset-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* Results count */}
      <div className="live-camps-results-count">
        Showing {filteredCamps.length} of {camps.length} upcoming camps
      </div>

      {/* Table */}
      <div className="live-camps-table-container">
        <table className="live-camps-table">
          <thead>
            <tr>
              <th>Camp Name</th>
              <th>Address</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentCamps.map((camp) => (
              <tr key={camp._id}>
                <td>{camp.campName}</td>
                <td>
                  {[camp.address, camp.city, camp.state, camp.country]
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td>{formatDate(camp.organizingDate)}</td>
                <td>
                  <button
                    className="live-camps-details-btn"
                    onClick={() => handleDetailsClick(camp)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="live-camps-pagination">
        <button
          className="live-camps-pagination-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span className="live-camps-pagination-span">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="live-camps-pagination-btn"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Camp Details Modal */}
      {selectedCamp && (
        <div className="live-camps-modal-overlay">
          <div className="live-camps-modal-content">
            <button className="live-camps-close-btn" onClick={closeDetails}>
              ×
            </button>
            <h3>{selectedCamp.campName}</h3>
            <div className="live-camps-camp-details">
              <p>
                <strong>Organizer:</strong> {selectedCamp.organizerName}
              </p>
              <p>
                <strong>Type:</strong> {selectedCamp.organizerType}
              </p>
              <p>
                <strong>Contact:</strong> {selectedCamp.organizerContact}
              </p>
              <p>
                <strong>Email:</strong> {selectedCamp.organizerEmail}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {[
                  selectedCamp.address,
                  selectedCamp.city,
                  selectedCamp.state,
                  selectedCamp.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedCamp.organizingDate)}
              </p>
              <p>
                <strong>Time:</strong> {selectedCamp.campStartTime} -{" "}
                {selectedCamp.campEndTime}
              </p>
              {selectedCamp.inCollaborationWith?.length > 0 && (
                <p>
                  <strong>In Collaboration With:</strong>{" "}
                  {selectedCamp.inCollaborationWith.join(", ")}
                </p>
              )}
              {selectedCamp.campDetails && (
                <p>
                  <strong>Details:</strong> {selectedCamp.campDetails}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCamps;
