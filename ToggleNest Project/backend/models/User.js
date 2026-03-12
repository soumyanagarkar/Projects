const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  title: { type: String },
  role: { type: String, default: 'member' }
});

// FIX: Check if model exists, otherwise compile it
module.exports = mongoose.models.User || mongoose.model("User", userSchema);