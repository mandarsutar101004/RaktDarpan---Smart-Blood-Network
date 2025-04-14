import React from "react";
import "./AboutSection.css";
import about from "../Photos/about.mp4" // Importing the CSS file

const AboutSection = () => {
  return (
    <div className="about-container">
      <h2 className="about-heading">About Us</h2>

      {/* Flex container */}
      <div className="about-content">
        {/* Left Column - About Text */}
        <div className="about-text">
          <p className="about-paragraph">
            Welcome to <span className="highlight">RaktDarpan</span>, a platform
            dedicated to connecting blood donors with those in urgent need. Our
            mission is to bridge the gap between donors and recipients through
            safe and efficient processes.
          </p>

          <p className="about-paragraph">
            Every year, lives are saved because someone chose to donate. With
            smart tools and real-time features, we aim to build a reliable and
            accessible blood network.
          </p>

          <h3 className="about-feature-heading">🌟 Key Features</h3>
          <ul className="about-feature-list">
            <li>
              <strong>Search</strong> for donors and hospitals near you.
            </li>
            <li>
              <strong>Request blood</strong> by submitting a form and emailing
              donors.
            </li>
            <li>
              Check your <strong>eligibility</strong> to donate blood.
            </li>
            <li>
              Access verified <strong>blood donation information</strong>.
            </li>
            <li>
              View <strong>live blood donation camps</strong> from trusted
              hospitals.
            </li>
            <li>
              <strong>Contact us</strong> easily for any queries or support.
            </li>
          </ul>

          <p className="about-paragraph">
            <span className="highlight">
              Donate blood. Save lives. Be the reason someone smiles today.
            </span>
          </p>
        </div>

        {/* Right Column - Video */}
        <div className="about-video">
          <div className="video-container">
            <video
              className="video-embed"
              src={about}
              autoPlay
              loop
              muted
              controls
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
