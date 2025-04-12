import React from "react";
import { useNavigate } from "react-router-dom";
import "./EligibilityChecker.css";

const EligibilityChecker = () => {
  const navigate = useNavigate();

  const handleCheckEligibility = () => {
    navigate("/eligibility-checker");
  };

  return (
    <div className="eligibility-container">
      <p className="eligibility-tag">
        Are you ready to save a life? Check your blood donation eligibility now!
      </p>
      <h2 className="eligibility-heading">
        Check Your Blood Donation Eligibility
      </h2>
      <button className="eligibility-button" onClick={handleCheckEligibility}>
        Check
      </button>
    </div>
  );
};

export default EligibilityChecker;
