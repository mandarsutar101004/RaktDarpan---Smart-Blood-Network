const userModel = require("../models/userModel");
require("dotenv").config({ path: "./utils/.env" });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Function to Get Latitude & Longitude from Address
const getCoordinates = async (city, district, state, country) => {
  try {
    const query = `${city}, ${district}, ${state}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json`;

    const response = await axios.get(url);
    if (response.data.length > 0) {
      return {
        latitude: response.data[0].lat,
        longitude: response.data[0].lon,
      };
    } else {
      return { latitude: null, longitude: null };
    }
  } catch (error) {
    console.error("Geocoding Error:", error);
    return { latitude: null, longitude: null };
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      role,
      name,
      gender,
      dob,
      email,
      mobile,
      bloodGroup,
      address,
      city,
      district,
      state,
      country,
      regNo,
      password,
    } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists!" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get Latitude & Longitude
    const { latitude, longitude } = await getCoordinates(
      city,
      district,
      state,
      country
    );

    // Create User
    const newUser = new userModel({
      role,
      name,
      gender,
      dob,
      email,
      mobile,
      bloodGroup,
      address,
      city,
      district,
      state,
      country,
      regNo,
      password: hashedPassword,
      latitude,
      longitude,
    });

    // Save to Database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Login User
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required!",
      });
    }

    // Check if user exists with the given email and role
    const user = await userModel.findOne({ email, role });
    if (!user) {
      return res.status(400).json({
        message: "User not found with the specified email and role!",
      });
    }

    // Check if user is active (optional)
    // if (user.status !== "active") {
    //   return res.status(403).json({
    //     message: "Account is not active. Please contact support.",
    //   });
    // }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // Generate JWT Token with additional user info
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token valid for 1 day
    );

    // Set cookie with token (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Successful response
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup, // Include additional fields as needed
        profilePic: user.profilePic,
      },
      expiresIn: 24 * 60 * 60, // 1 day in seconds
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//Current User
const currentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all Donors
const getAllDonors = async (req, res) => {
  try {
    const donors = await userModel.find({ role: "Donor" }).select("-password"); // Exclude password field
    res.status(200).json(donors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching donors", error: error.message });
  }
};

//Update User
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Get logged-in user ID
    const updates = req.body;

    // Fetch current user data
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if location-related fields are changed
    const locationFields = ["city", "district", "state", "country"];
    const isLocationUpdated = locationFields.some(
      (field) => updates[field] && updates[field] !== existingUser[field]
    );

    // If location fields are updated, get new coordinates
    if (isLocationUpdated) {
      const { city, district, state, country } = {
        ...existingUser._doc,
        ...updates, // Merge existing user data with updated fields
      };

      const { latitude, longitude } = await getCoordinates(
        city,
        district,
        state,
        country
      );
      updates.latitude = latitude;
      updates.longitude = longitude;
    }

    // Update user details
    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const matchDonors = async (req, res) => {
  try {
    const recipientData = req.body;

    // Send request to Python ML API for donor matching
    const response = await axios.post(
      "http://127.0.0.1:5000/matchDonors",
      recipientData
    );

    res.json(response.data); // Return matched donors
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error matching donors", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  getAllDonors,
  updateUser,
  matchDonors,
};
