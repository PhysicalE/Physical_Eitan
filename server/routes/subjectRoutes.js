const express = require("express");
const router = express.Router();

const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require("../controllers/subjectController");

// 📥 יצירת סובג'קט חדש
router.post("/", createSubject);

// 📤 קבלת כל הסובג'קטים
router.get("/", getAllSubjects);

// 🔍 קבלת סובג'קט לפי מזהה
router.get("/:id", getSubjectById);

// ✏️ עדכון סובג'קט לפי מזהה
router.put("/:id", updateSubject);

// ❌ מחיקת סובג'קט לפי מזהה
router.delete("/:id", deleteSubject);

module.exports = router;
