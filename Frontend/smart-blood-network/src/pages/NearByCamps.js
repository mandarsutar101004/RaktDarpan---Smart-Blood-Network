import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./NearByCamps.module.css";

const NearByCamps = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyCamps, setNearbyCamps] = useState([]);
  const [loading, setLoading] = useState({
    location: false,
    camps: false,
  });
  const [error, setError] = useState(null);

  // Fetch user location
  const fetchUserLocation = async () => {
    try {
      setLoading((prev) => ({ ...prev, location: true }));
      setError(null);

      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:8081/api/users/currentUser",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      let lat, lon;

      if (data.latitude && data.longitude) {
        lat = data.latitude;
        lon = data.longitude;
      } else if (data.data?.latitude && data.data?.longitude) {
        lat = data.data.latitude;
        lon = data.data.longitude;
      } else {
        throw new Error("Invalid location data structure");
      }

      setUserLocation({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      });
    } catch (err) {
      setError("Failed to fetch your location");
      console.error("Location fetch error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, location: false }));
    }
  };

  // Fetch nearby camps
  const fetchNearbyCamps = async () => {
    if (!userLocation) return;

    try {
      setLoading((prev) => ({ ...prev, camps: true }));
      setError(null);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:8081/api/camps/matchCamps",
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          maxDistance: 50, // Fixed distance
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNearbyCamps(response.data.results?.camps || []);
    } catch (err) {
      setError("Failed to fetch nearby camps");
      console.error("Camps fetch error:", err.response?.data || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, camps: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserLocation();
  }, []);

  // Fetch camps when location changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyCamps();
    }
  }, [userLocation]);

  const refreshData = () => {
    fetchUserLocation();
    fetchNearbyCamps();
  };

  return (
    <div className={styles.nearbyCampsContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Nearby Blood Donation Camps</h1>
          <p className={styles.subtitle}>
            Find the closest blood donation opportunities in your area
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading.location || loading.camps}
          className={styles.refreshBtn}
        >
          {loading.location || loading.camps ? (
            <span className={styles.spinner}></span>
          ) : (
            <>
              <i className={styles.iconRefresh}></i>
              Refresh
            </>
          )}
        </button>
      </header>

      {error && (
        <div className={styles.errorMessage}>
          <i className={styles.iconWarning}></i>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchUserLocation();
            }}
            className={styles.retryBtn}
          >
            Retry
          </button>
        </div>
      )}

      <div className={styles.dashboard}>
        <section className={styles.userInfo}>
          <div className={styles.infoCard}>
            <h2>
              <i className={styles.iconLocation}></i>
              Your Location
            </h2>
            {loading.location ? (
              <div className={styles.loadingSpinner}></div>
            ) : userLocation ? (
              <div className={styles.locationDetails}>
                <div className={styles.locationItem}>
                  <span className={styles.label}>Latitude:</span>
                  <span className={styles.value}>
                    {userLocation.latitude.toFixed(6)}
                  </span>
                </div>
                <div className={styles.locationItem}>
                  <span className={styles.label}>Longitude:</span>
                  <span className={styles.value}>
                    {userLocation.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.noLocation}>Location not available</p>
            )}
          </div>
        </section>

        <section className={styles.campsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className={styles.iconCamp}></i>
              Available Camps
            </h2>
            <div className={styles.resultsCount}>
              {nearbyCamps.length > 0 && `${nearbyCamps.length} found`}
            </div>
          </div>

          {loading.camps ? (
            <div className={styles.loadingSpinnerLarge}></div>
          ) : nearbyCamps.length > 0 ? (
            <div className={styles.campsGrid}>
              {nearbyCamps.map((camp) => (
                <article key={camp._id} className={styles.campCard}>
                  <div className={styles.cardHeader}>
                    <h3>{camp.campName}</h3>
                    <div className={styles.campMeta}>
                      <span className={styles.distance}>
                        <i className={styles.iconDistance}></i>
                        {camp.distance.toFixed(2)} km
                      </span>
                      <span className={styles.date}>
                        <i className={styles.iconCalendar}></i>
                        {new Date(camp.organizingDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.timeInfo}>
                      <i className={styles.iconClock}></i>
                      {camp.campStartTime} - {camp.campEndTime}
                    </div>
                    <div className={styles.campDetails}>
                      <p className={styles.address}>
                        <i className={styles.iconPin}></i>
                        {camp.address}
                      </p>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Organizer:</span>
                        <span className={styles.detailValue}>
                          {camp.organizerName}
                        </span>
                      </div>
                      {camp.organizerContact && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Contact:</span>
                          <span className={styles.detailValue}>
                            {camp.organizerContact}
                          </span>
                        </div>
                      )}
                      {camp.campDetails && (
                        <div className={styles.description}>
                          <p>{camp.campDetails}</p>
                        </div>
                      )}
                      {camp.inCollaborationWith?.length > 0 && (
                        <div className={styles.collaborators}>
                          <span className={styles.detailLabel}>Partners:</span>
                          <div className={styles.partnerTags}>
                            {camp.inCollaborationWith.map((partner, index) => (
                              <span key={index} className={styles.partnerTag}>
                                {partner}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <button className={styles.viewBtn}>
                      <i className={styles.iconEye}></i>
                      View Details
                    </button>
                    <button className={styles.registerBtn}>
                      <i className={styles.iconEdit}></i>
                      Register
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <i className={styles.iconSearch}></i>
              <p>No blood donation camps found in your area</p>
              <button onClick={refreshData} className={styles.refreshBtn}>
                Try Again
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NearByCamps;
