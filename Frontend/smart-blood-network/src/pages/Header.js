import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import axios from "axios";
import ScrollLink from "./ScrollLink";
import userLogo from "../Photos/user.png";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        setUser(null);
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
      localStorage.setItem("userData", JSON.stringify(response.data));
    } catch (err) {
      console.error("Error fetching user data:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      fetchCurrentUser();
    } else {
      setUser(null);
      localStorage.removeItem("userData");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login");
      return;
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to render dynamic sidebar links based on user role
  const renderRoleSpecificLinks = () => {
    if (!user || !user.role) return null;

    switch (user.role) {
      case "Donor":
      case "Recipient":
        return (
          <Link
            to="/blood-camps"
            className="sidebar-link"
            onClick={toggleSidebar}
          >
            Blood Camps Near Me
          </Link>
        );
      case "Hospital":
      case "Organization":
        return (
          <>
            <Link
              to="/register-blood-camp"
              className="sidebar-link"
              onClick={toggleSidebar}
            >
              Register Blood Camps
            </Link>
            <Link
              to="/manage-blood-camps"
              className="sidebar-link"
              onClick={toggleSidebar}
            >
              Manage Blood Camps
            </Link>
          </>
        );
      case "Admin":
        return (
          <Link
            to="/user-management"
            className="sidebar-link"
            onClick={toggleSidebar}
          >
            User Management
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="header-container">
        <div className="header-brand">
          <Link to="/" className="logo-link">
            <h1 className="logo">RaktDarpan</h1>
            <p className="tagline">Smart Blood Network</p>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/request-blood" className="nav-link">
            Request Blood
          </Link>

          <ScrollLink to="findDonors" className="nav-link">
            Find Donors
          </ScrollLink>

          <ScrollLink to="findHospitals" className="nav-link">
            Find Hospitals
          </ScrollLink>

          <ScrollLink to="contact" className="nav-link">
            Contact
          </ScrollLink>

          <div
            className="profile-dropdown"
            onClick={user ? toggleSidebar : () => navigate("/login")}
          >
            <img
              src={userLogo}
              alt="Profile"
              className="profile-avatar"
              id="userLogo"
            />
            <span className="profile-name">
              {user ? user.name || user.email : "Profile"}
            </span>
          </div>
        </nav>

        <button className="mobile-menu-button">
          <span className="menu-icon">☰</span>
        </button>
      </header>

      {user && (
        <>
          <div className={`profile-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <img src={userLogo} alt="Profile" className="sidebar-avatar" />
              <div className="sidebar-user-info">
                <h3>{user.name || "User"}</h3>
                <p>{user.email}</p>
                {user.role && <span className="user-role">{user.role}</span>}
              </div>
              <button className="close-sidebar" onClick={toggleSidebar}>
                &times;
              </button>
            </div>

            <nav className="sidebar-nav">
              <Link
                to="/dashboard"
                className="sidebar-link"
                onClick={toggleSidebar}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="sidebar-link"
                onClick={toggleSidebar}
              >
                My Profile
              </Link>

              {/* Common links for all roles */}
              <Link
                to="/update-profile"
                className="sidebar-link"
                onClick={toggleSidebar}
              >
                Update Profile
              </Link>

              {/* Role-specific links */}
              {renderRoleSpecificLinks()}

              <Link
                to="/settings"
                className="sidebar-link"
                onClick={toggleSidebar}
              >
                Delete Account
              </Link>

              <button className="sidebar-link logout" onClick={handleLogout}>
                Logout
              </button>
            </nav>
          </div>

          {isSidebarOpen && (
            <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          )}
        </>
      )}
    </>
  );
};

export default Header;
