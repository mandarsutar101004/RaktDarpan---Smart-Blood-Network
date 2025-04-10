const mongoose = require("mongoose");
const { Schema } = mongoose;

const bloodCampSchema = new Schema(
  {
    // Camp Information
    campName: {
      type: String,
      required: [true, "Camp name is required"],
      trim: true,
      maxlength: [100, "Camp name cannot exceed 100 characters"],
    },

    // Organizer Details
    organizerName: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
    },
    organizerType: {
      type: String,
      enum: [
        "NGO",
        "Hospital",
        "Government",
        "Corporate",
        "Educational",
        "Other",
      ],
      required: [true, "Organizer type is required"],
    },
    organizerContact: {
      type: String,
      required: [true, "Contact number is required"],
      validate: {
        validator: function (v) {
          return /^[0-9]{10,15}$/.test(v); // Validates 10-15 digit phone number
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    organizerEmail: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    inCollaborationWith: {
      type: [String], // Array of partner organizations
      default: [],
    },

    // Date and Time
    organizingDate: {
      type: Date,
      required: [true, "Organizing date is required"],
      validate: {
        validator: function (date) {
          return date > new Date(); // Future date validation
        },
        message: "Organizing date must be in the future!",
      },
    },
    campStartTime: {
      type: String, // Format: "HH:MM" (e.g., "09:30")
      required: [true, "Start time is required"],
    },
    campEndTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (endTime) {
          return endTime.localeCompare(this.campStartTime) === 1; // Validates endTime > startTime
        },
        message: "End time must be after start time!",
      },
    },

    // Location
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: -180,
      max: 180,
    },

    // Additional Info
    campDetails: {
      type: String,
      trim: true,
      maxlength: [500, "Details cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true, // Auto-adds `createdAt` and `updatedAt`
  }
);

// Indexes for query optimization
bloodCampSchema.index({ organizingDate: 1 }); // For filtering by date
bloodCampSchema.index({ city: 1, state: 1 }); // For location-based queries

// Pre-save hook for additional validations (if needed)
bloodCampSchema.pre("save", function (next) {
  // Example: Capitalize organizer name
  if (this.organizerName) {
    this.organizerName = this.organizerName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  next();
});

const BloodCamp = mongoose.model("BloodCamp", bloodCampSchema);
module.exports = BloodCamp;
