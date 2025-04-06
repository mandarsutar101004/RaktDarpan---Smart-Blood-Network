import React from "react";
import sbn3 from "../Photos/sbn3.jpg"; // Adjust the path as necessary
import "./LearnAboutDonation.css";

const LearnAboutDonation = () => {
  return (
    <div className="donation-container">
      {/* Left Section - Image & Button */}
      <div className="image-container">
        <img
          src={sbn3}
          alt="Blood Donation"
          className="donation-image"
        />
        <button className="donate-button">Donate Now</button>
      </div>

      {/* Right Section - Blood Compatibility Table */}
      <div className="table-container">
        <div className="table-content">
          <h2>BLOOD COMPATIBILITY CHART</h2> {/* Added Title Above Table */}
          <table className="table">
            <thead>
              <tr>
                <th>Blood Type</th>
                <th>Can Donate To</th>
                <th>Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>O-</td>
                <td>All Blood Types</td>
                <td>O- Only</td>
              </tr>
              <tr>
                <td>O+</td>
                <td>O+, A+, B+, AB+</td>
                <td>O+, O-</td>
              </tr>
              <tr>
                <td>A-</td>
                <td>A+, A-, AB+, AB-</td>
                <td>A-, O-</td>
              </tr>
              <tr>
                <td>A+</td>
                <td>A+, AB+</td>
                <td>A+, A-, O+, O-</td>
              </tr>
              <tr>
                <td>B-</td>
                <td>B+, B-, AB+, AB-</td>
                <td>B-, O-</td>
              </tr>
              <tr>
                <td>B+</td>
                <td>B+, AB+</td>
                <td>B+, B-, O+, O-</td>
              </tr>
              <tr>
                <td>AB-</td>
                <td>AB+, AB-</td>
                <td>AB-, A-, B-, O-</td>
              </tr>
              <tr>
                <td>AB+</td>
                <td>AB+ Only</td>
                <td>All Blood Types</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LearnAboutDonation;
