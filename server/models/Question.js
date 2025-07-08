const mongoose = require("mongoose");

// תת-סכמה של תשובה או שלב פתרון
const AnswerSchema = new mongoose.Schema({
  type: { type: String, enum: ["text", "image", "text+image"], required: true },
  text: { type: String },
  image: { type: String },
  order: { type: Number }
}, { _id: false }); // חשוב: כדי שלא יווצר אוטומטית _id פנימי

// תת-סכמה של תוכן השאלה
const ContentSchema = new mongoose.Schema({
  text: { type: String },
  image: { type: String }
}, { _id: false }); // גם כאן, בלי יצירת מזהים מיותרים

const QuestionSchema = new mongoose.Schema({
  question_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  student_id: { type: String },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  media_url: { type: String },
  title: { type: String, required: true },
  image: { type: String },
  content: ContentSchema, // כאן במקום סתם אובייקט
  hints: [{ type: String }],
  solution: { type: String, required: true },
  correct_answers: [AnswerSchema], // כאן
  solution_steps: [AnswerSchema], // גם כאן
  status: { type: Boolean, default: false },
  tags: [{ type: String }],
  subject: { type: String, required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
