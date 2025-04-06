import React from "react";
import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("recipient");

  const recipientSteps = [
    {
      emoji: "🆘",
      title: "1. Request Blood",
      description: "Submit your blood requirement details",
    },
    {
      emoji: "🔍",
      title: "2. Find Matches",
      description: "Get compatible donor matches instantly",
    },
    {
      emoji: "💬",
      title: "3. Connect",
      description: "Chat directly with verified donors",
    },
    {
      emoji: "🏥",
      title: "4. Receive Blood",
      description: "Coordinate donation at a trusted center",
    },
  ];

  const donorSteps = [
    {
      emoji: "📱",
      title: "1. Register",
      description: "Join as a donor in 2 minutes",
    },
    {
      emoji: "🔔",
      title: "2. Get Alerts",
      description: "Receive nearby blood requests",
    },
    {
      emoji: "📍",
      title: "3. Confirm Availability",
      description: "Accept requests you can fulfill",
    },
    {
      emoji: "❤️",
      title: "4. Donate",
      description: "Visit a center & save lives",
    },
  ];

  const handleRequestBlood = () => {
    navigate("/request-blood");
  };

  const handleRegisterDonor = () => {
    navigate("/register");
  };

  return (
    <section className="how-it-works">
      <div className="container">
        <h2>How It Works</h2>

        <div className="flow-tabs">
          <div
            className={`tab ${activeTab === "recipient" ? "active" : ""}`}
            onClick={() => setActiveTab("recipient")}
          >
            For Recipients
          </div>
          <div
            className={`tab ${activeTab === "donor" ? "active" : ""}`}
            onClick={() => setActiveTab("donor")}
          >
            For Donors
          </div>
        </div>

        <div className="steps-container">
          {/* Recipient Flow */}
          <div
            className={`flow-section ${
              activeTab === "recipient" ? "active" : ""
            }`}
          >
            <div className="steps-grid">
              {recipientSteps.map((step, index) => (
                <div key={`recipient-${index}`} className="step-card">
                  <span className="step-emoji">{step.emoji}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
            <div className="cta-group">
              <button
                className="cta-button primary"
                onClick={handleRequestBlood}
              >
                Request Blood Now
              </button>
              <button className="cta-button secondary">
                Emergency Hotline
              </button>
            </div>
          </div>

          {/* Donor Flow */}
          <div
            className={`flow-section ${activeTab === "donor" ? "active" : ""}`}
          >
            <div className="steps-grid">
              {donorSteps.map((step, index) => (
                <div key={`donor-${index}`} className="step-card">
                  <span className="step-emoji">{step.emoji}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
            <div className="cta-group">
              <button
                className="cta-button primary"
                onClick={handleRegisterDonor}
              >
                Register as Donor
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
