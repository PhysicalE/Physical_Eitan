const Subject = require("../models/Subject");

// 📥 יצירת סובג'קט חדש
const createSubject = async (req, res) => {
  try {
    const { tags, name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newSubject = await Subject.create({ tags, name });
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📤 קבלת כל הסובג'קטים
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 קבלת סובג'קט לפי ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ עדכון סובג'קט לפי ID
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags, name } = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { tags, name },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ מחיקת סובג'קט לפי ID
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
