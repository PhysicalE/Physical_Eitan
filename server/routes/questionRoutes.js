const express = require("express");
const router = express.Router();

// ✅ Use in-memory storage instead of writing to disk (Vercel is read-only)
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { verifyToken, verifyAdmin, verifyAdminOrTeacher } = require("../middleware/authMiddleware");
const myCache = require("../utils/cache");
const Question = require("../models/Question");
const {
  uploadQuestionImage,
  uploadQuestion,
  deleteQuestion,
  editQuestion,
  getQuestion,
  giveHint,
  testSolution,
  approveQuestion,
  addSolutionSteps,
  getQuestionsByTag,
  showSolution,
  nextQuestion,
  getAllUnapprovedQuestions,
  getAllApprovedQuestions,
  getQuestionsBySubject
} = require("../controllers/questionController");

console.log("✅ Routes loaded!");

// ✅ Image upload
router.post("/upload-image", verifyToken, upload.any(), uploadQuestionImage);

router.get('/questions/upload-image', (req, res) => {
  res.status(405).json({ error: "GET not allowed on /upload-image" });
});

// 📌 אישור שאלה
router.put("/approve", (req, res, next) => {
  console.log("✅ Request received at /approve");
  next();
}, verifyToken, verifyAdminOrTeacher, approveQuestion);

// 📌 הוספת שאלה
router.post("/", verifyToken, uploadQuestion);

// 📌 מחיקת שאלה
router.delete("/:id", verifyToken, deleteQuestion);

// 📌 עריכת שאלה
router.put("/:id", editQuestion);

// 📌 שליפת כל השאלות שלא אושרו
router.get("/unapproved", getAllUnapprovedQuestions);

// 📌 שליפת כל השאלות המאושרות
router.get("/approved", getAllApprovedQuestions);

// 📌 שליפת שאלות לפי נושא
router.get("/by-subject/:subjectId", getQuestionsBySubject);

// 📌 שליפת רמז
router.get("/:id/hint/:hintIndex", giveHint);

// 📌 בדיקת תשובה
router.post("/:id/test", testSolution);

// 📌 הצגת פתרון
router.get("/:id/solution", showSolution);

// 📌 הוספת דרכי פתרון
router.put("/:id/solution-steps", addSolutionSteps);

// 📌 שאלה הבאה
router.get("/:id/next", async (req, res, next) => {
  try {
    const { id } = req.params;
    let cachedNextQuestion = myCache.get(`${id}-next`);
    if (cachedNextQuestion) {
      console.log("Returning next question from cache...");
      return res.status(200).json(cachedNextQuestion);
    }
    await nextQuestion(req, res);
  } catch (error) {
    next(error);
  }
});



// 📌 שליפת שאלות לפי תגית
router.get("/by-tag/:tag", verifyToken, getQuestionsByTag);

// 📌 שאלות בפנדינג למאשרים בלבד
router.get("/pending", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pendingQuestions = await Question.find({ status: "pending" });
    res.status(200).json(pendingQuestions);
  } catch (error) {
    console.error("❌ Error fetching pending questions:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 שליפת שאלה בודדת לפי ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let cachedQuestion = myCache.get(id);
    if (cachedQuestion) {
      console.log("Returning question from cache...");
      return res.status(200).json(cachedQuestion);
    }
    await getQuestion(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
