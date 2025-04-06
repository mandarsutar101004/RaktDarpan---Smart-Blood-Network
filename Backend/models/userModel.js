const mongoose = require("mongoose");

//Schema
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["Donor", "Recipient", "Hospital", "Organization", "Admin"],
      required: true,
    },
    name: { type: String, required: true },
    designation: {
      type: String,
      required: true,
      default: function () {
        return this.role === "Admin" ? "RaktDarpan Admin" : "RaktDarpan Member";
      },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: function () {
        return this.role !== "Hospital" && this.role !== "Organization";
      },
    },
    dob: {
      type: Date,
      required: function () {
        return this.role !== "Hospital" && this.role !== "Organization";
      },
    },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: function () {
        return this.role === "Donor" || this.role === "Recipient";
      },
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    regNo: {
      type: String,
      required: function () {
        return this.role === "Hospital" || this.role === "Organization";
      },
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

//Model
const User = mongoose.model("User", userSchema);

module.exports = User;
