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

module.exports = {
  registerCamp,
  getAllCamps,
};
