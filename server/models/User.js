const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  approved_by: { type: String, required: false }, 
  created_date: { type: Date, default: Date.now },
  requested_role: { type: String, enum: ["teacher"], required: false }
});

module.exports = mongoose.model("User", UserSchema);
