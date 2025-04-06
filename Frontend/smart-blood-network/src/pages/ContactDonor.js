import React, { useState } from "react";
import { sendDonorNotification } from "../Services/handleContact";
import PropTypes from "prop-types";

const ContactDonor = ({ donor, requestData, onContactSuccess }) => {
  const [isSending, setIsSending] = useState(false);

  const handleClick = async () => {
    if (!donor?.email || !requestData?.bloodGroup) {
      console.error("Missing required donor data");
      return;
    }

    setIsSending(true);
    try {
      await sendDonorNotification(donor, requestData);
      onContactSuccess?.(donor);
    } catch (error) {
      console.error("Contact error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      className="btn btn-success w-100"
      onClick={handleClick}
      disabled={isSending}
      aria-label={`Contact ${donor.name}`}
    >
      {isSending ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          Sending...
        </>
      ) : (
        <>
          <i className="bi bi-telephone-outbound me-2" aria-hidden="true"></i>
          Contact Donor
        </>
      )}
    </button>
  );
};

ContactDonor.propTypes = {
  donor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    // Add other donor properties
  }).isRequired,
  requestData: PropTypes.shape({
    recipientName: PropTypes.string,
    bloodGroup: PropTypes.string.isRequired,
    // Add other required fields
  }).isRequired,
  onContactSuccess: PropTypes.func,
};

export default ContactDonor;
