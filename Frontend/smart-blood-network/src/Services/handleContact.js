import axios from "axios";
import { toast } from "react-toastify";

export const sendDonorNotification = async (donor, requestData) => {
  try {
    const notificationData = {
      recipientEmail: donor.email,
      recipientName: donor.name,
      bloodGroup: requestData.bloodGroup,
      patientName: requestData.recipientName,
      patientLocation:
        requestData.location || `${requestData.city}, ${requestData.state}`,
      patientContact: requestData.contact,
      requiredDate: requestData.requiredDate,
      patientAge: requestData.age,
      hospitalName: requestData.hospitalName,
      hospitalAddress: requestData.address,
      city: requestData.city,
      district: requestData.district,
      state: requestData.state,
      country: requestData.country,
      patientGender: requestData.gender,
    };

    const response = await axios.post(
      "http://localhost:8081/api/notifications/sendNotification",
      notificationData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    toast.success(`Notification sent to ${donor.name}`);
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Failed to send notification";
    toast.error(`Error: ${errorMsg}`);
    throw error;
  }
};
