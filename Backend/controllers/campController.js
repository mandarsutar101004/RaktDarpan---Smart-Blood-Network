const BloodCamp = require("../models/campModel");
const axios = require("axios");

const getCoordinates = async (
  address,
  city,
  district,
  state,
  country = "India"
) => {
  try {
    // Create multiple query variations to improve success rate
    const queries = [
      `${address}, ${city}, ${state}, ${country}`, // Full address
      `${city}, ${state}, ${country}`, // City-level
      `${district}, ${state}, ${country}`, // District-level
      `${state}, ${country}`, // State-level
    ];

    for (const query of queries) {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json`;

      const response = await axios.get(url, {
        headers: {
          "User-Agent": "YourAppName", // Required by Nominatim
        },
      });

      if (response.data?.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          precision: result.importance, // Indicates match quality
        };
      }
    }

    console.warn("No coordinates found for any query variation");
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error("Geocoding Error:", error.message);
    return { latitude: null, longitude: null };
  }
};

const registerCamp = async (req, res) => {
  try {
    // Destructure all fields from req.body
    const {
      campName,
      organizerName,
      organizerType,
      organizerContact,
      organizerEmail,
      inCollaborationWith, // Can be array or string
      organizingDate,
      campStartTime,
      campEndTime,
      address,
      city,
      district,
      state,
      country,
      campDetails,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      campName: "Camp name",
      organizerName: "Organizer name",
      organizerType: "Organizer type",
      organizerContact: "Contact number",
      organizerEmail: "Email",
      organizingDate: "Date",
      campStartTime: "Start time",
      campEndTime: "End time",
      address: "Address",
      city: "City",
      state: "State",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !req.body[key])
      .map(([_, name]) => name);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Process collaborators - handle both array and string input
    let collaborators = [];
    if (inCollaborationWith) {
      collaborators = Array.isArray(inCollaborationWith)
        ? inCollaborationWith
        : inCollaborationWith
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
    }

    // Get coordinates - pass all location components
    const { latitude, longitude } = await getCoordinates(
      req.body.address,
      req.body.city,
      req.body.district,
      req.body.state,
      req.body.country
    );

    // Validate coordinates
    if (latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: "Could not determine location coordinates",
      });
    }

    // Check for existing camp
    const existingCamp = await BloodCamp.findOne({
      campName,
      organizingDate,
    });

    if (existingCamp) {
      return res.status(400).json({
        success: false,
        message: "A camp with this name and date already exists",
      });
    }

    // Create new camp
    const newCamp = new BloodCamp({
      campName,
      organizerName,
      organizerType,
      organizerContact,
      organizerEmail,
      inCollaborationWith: collaborators,
      organizingDate,
      campStartTime,
      campEndTime,
      address,
      city,
      district,
      state,
      country: country || "India",
      latitude,
      longitude,
      campDetails,
    });

    const savedCamp = await newCamp.save();

    res.status(201).json({
      success: true,
      message: "Blood camp registered successfully",
      data: savedCamp,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Get all blood camps
// @route   GET /api/camps
const getAllCamps = async (req, res) => {
  try {
    const camps = await BloodCamp.find().sort({ organizingDate: 1 });
    res.status(200).json({
      success: true,
      count: camps.length,
      data: camps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching camps",
      error: error.message,
    });
  }
};

// controllers/campController.js

const matchCamps = async (req, res) => {
  try {
    // Get token from request (ensure your auth middleware attaches it)
    const token = req.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const { latitude, longitude, maxDistance, limit } = req.body;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Call Python API with proper authorization
    const response = await axios.post(
      "http://127.0.0.1:5001/findNearbyCamps",
      {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error in matchCamps:", error);

    // Improved error response
    let status = 500;
    let message = "Error finding nearby camps";

    if (error.response) {
      status = error.response.status;
      message = error.response.data?.error || message;
    }

    res.status(status).json({
      success: false,
      message,
      details: error.response?.data || error.message,
    });
  }
};

// @desc    Update blood camp details
const updateCamp = async (req, res) => {
  try {
    const {
      _id,
      campName,
      organizerName,
      organizerType,
      organizerContact,
      organizerEmail,
      inCollaborationWith,
      organizingDate,
      campStartTime,
      campEndTime,
      address,
      city,
      district,
      state,
      country,
      campDetails,
    } = req.body;

    // Validate camp ID
    if (!_id || !_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid camp ID",
      });
    }

    // Find existing camp
    const existingCamp = await BloodCamp.findById(_id);
    if (!existingCamp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found",
      });
    }

    // Prepare updates with existing values as fallback
    const updates = {
      campName: campName ?? existingCamp.campName,
      organizerName: organizerName ?? existingCamp.organizerName,
      organizerType: organizerType ?? existingCamp.organizerType,
      organizerContact: organizerContact ?? existingCamp.organizerContact,
      organizerEmail: organizerEmail ?? existingCamp.organizerEmail,
      organizingDate: organizingDate ?? existingCamp.organizingDate,
      address: address ?? existingCamp.address,
      city: city ?? existingCamp.city,
      district: district ?? existingCamp.district,
      state: state ?? existingCamp.state,
      country: country ?? existingCamp.country,
      campDetails: campDetails ?? existingCamp.campDetails,
    };

    // Handle time updates carefully
    if (campStartTime || campEndTime) {
      const newStartTime = campStartTime ?? existingCamp.campStartTime;
      const newEndTime = campEndTime ?? existingCamp.campEndTime;

      // Convert to minutes for comparison
      const startMinutes = convertTimeToMinutes(newStartTime);
      const endMinutes = convertTimeToMinutes(newEndTime);

      if (startMinutes >= endMinutes) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }

      updates.campStartTime = newStartTime;
      updates.campEndTime = newEndTime;
    }

    // Process collaborators
    if (inCollaborationWith !== undefined) {
      updates.inCollaborationWith = Array.isArray(inCollaborationWith)
        ? inCollaborationWith
        : String(inCollaborationWith)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    // Handle location changes
    if (address || city || district || state || country) {
      const { latitude, longitude } = await getCoordinates(
        updates.address,
        updates.city,
        updates.district,
        updates.state,
        updates.country
      );

      if (latitude && longitude) {
        updates.latitude = latitude;
        updates.longitude = longitude;
      }
    }

    // Update camp while bypassing schema validation for times
    const updatedCamp = await BloodCamp.findByIdAndUpdate(
      _id,
      { $set: updates },
      {
        new: true,
        runValidators: false, // Bypass schema validation
        context: "query",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Camp updated successfully",
      data: updatedCamp,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during update",
      error: error.message,
    });
  }
};

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = String(timeString).split(":").map(Number);
  return hours * 60 + minutes;
}

// @desc    Delete a blood camp
// @desc    Delete a blood camp
// @route   DELETE /api/camps/deleteCamp
const deleteCamp = async (req, res) => {
  try {
    // Get ID from request body instead of params
    const { _id } = req.body;

    // Validate camp ID exists and has correct format
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Camp ID is required in request body"
      });
    }

    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid camp ID format"
      });
    }

    // Check if camp exists
    const camp = await BloodCamp.findById(_id);
    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found"
      });
    }

    // Delete the camp
    await BloodCamp.findByIdAndDelete(_id);

    res.status(200).json({
      success: true,
      message: "Camp deleted successfully",
      data: {
        id: _id,
        campName: camp.campName,
        date: camp.organizingDate
      }
    });

  } catch (error) {
    console.error("Delete error:", error);
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid camp ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during camp deletion",
      error: error.message
    });
  }
};

module.exports = {
  registerCamp,
  getAllCamps,
  matchCamps,
  updateCamp,
  deleteCamp,
};
