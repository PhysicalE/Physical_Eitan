const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  tags: [{ type: String }],
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Subject", SubjectSchema, "subject");
