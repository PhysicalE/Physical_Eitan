const myCache = require("../utils/cache");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const User = require("../models/User");
const fs = require("fs");
const { uploadImageToCloudinary, deleteImageFromCloudinary, moveImageToFolder } = require('../utils/cloudinary');


// 📌 הוספת שאלה חדשה
exports.uploadQuestion = async (req, res) => {
  try {
    console.log("🔵 Attempt to upload a new question started");

    const {
      title,
      subject,
      subject_id,
      solution,
      hints = [],
      tags = [],
      content,
      correct_answers,
      solution_steps
    } = req.body;

    // ✅ Check required fields
    if (!title || !subject || !subject_id || !solution) {
      return res.status(400).json({ message: "Missing required fields: title, subject, subject_id, or solution." });
    }

    // ✅ Handle file upload (if sent)
    if (req.file) {
      const { role } = req.user;
      const uploadRes = await uploadImageToCloudinary(req.file.buffer, role, "question");

      content.image = uploadRes.secure_url;
    }

    // ✅ Validate content
    if (!content || (!content.text && !content.image)) {
      return res.status(400).json({ message: "Question must have at least text or image content." });
    }
    if (content.image && !content.image.includes("res.cloudinary.com")) {
      return res.status(400).json({ message: "Image must be hosted on Cloudinary." });
    }

    // ✅ Validate correct_answers
    if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
      return res.status(400).json({ message: "At least one correct answer is required." });
    }
    for (const answer of correct_answers) {
      if (!["text", "image", "text+image"].includes(answer.type)) {
        return res.status(400).json({ message: "Invalid answer type." });
      }
      if (answer.type === "text" && !answer.text) {
        return res.status(400).json({ message: "Text answer must include text." });
      }
      if (answer.type.includes("image") && (!answer.image || !answer.image.includes("res.cloudinary.com"))) {
        return res.status(400).json({ message: "Answer image must be a valid Cloudinary URL." });
      }
    }

    // ✅ Validate solution_steps
    const parsedSteps = solution_steps || [];
    for (const step of parsedSteps) {
      if (!["text", "image", "text+image"].includes(step.type)) {
        return res.status(400).json({ message: "Invalid solution step type." });
      }
      if (step.type === "text" && !step.text) {
        return res.status(400).json({ message: "Text step must include text." });
      }
      if (step.type.includes("image") && (!step.image || !step.image.includes("res.cloudinary.com"))) {
        return res.status(400).json({ message: "Step image must be a valid Cloudinary URL." });
      }
    }

    // ✅ Determine role
    const { id, role } = req.user;
    const isTeacherOrAdmin = role === 'teacher' || role === 'admin';

    const questionData = {
      title,
      subject,
      subject_id,
      solution,
      hints,
      tags,
      content,
      correct_answers,
      solution_steps: parsedSteps,
      teacher_id: isTeacherOrAdmin ? id : undefined,
      approved_by: isTeacherOrAdmin ? id : undefined,
      status: isTeacherOrAdmin ? true : false,
      student_id: !isTeacherOrAdmin ? id : undefined
    };

    const newQuestion = await Question.create(questionData);
    console.log(`✅ New question created successfully. Question ID: ${newQuestion._id}`);
    res.status(201).json(newQuestion);

  } catch (error) {
    console.error("❌ Error while uploading question:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadQuestionImage = async (req, res) => {
  try {
    console.log("📥 Received image upload request");

    if (!req.files || req.files.length === 0) {
      console.log("❌ No file found in req.files");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files[0];
    console.log("📎 file:", file.originalname, file.size);

    const { role } = req.user;
    const { type } = req.body;

    if (!["question", "solution", "detailed"].includes(type)) {
      return res.status(400).json({ message: "Missing or invalid image type" });
    }

    const uploadRes = await uploadImageToCloudinary(file.buffer, role, type);

    res.status(200).json({
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });
  } catch (error) {
    console.error("❌ Error during image upload:", error.message);
    res.status(500).json({ message: "Failed to upload image" });
  }
};


function extractPublicIdFromUrl(url) {
  try {
    const path = url.split('/upload/')[1]; // e.g., v1717784090/Approved%20Solution/abc123_xyz.png
    const withoutVersion = path.replace(/^v\d+\//, '');
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, '');
    return decodeURIComponent(withoutExtension);
  } catch {
    return null;
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    console.log(`🔵 Attempt to delete question started. Question ID: ${req.params.id}`);

    const { role } = req.user;

    if (role !== 'admin' && role !== 'teacher') {
      console.warn(`⚠️ Permission denied for user with role: ${role}`);
      return res.status(403).json({ message: "Permission denied. Only admins or teachers can delete questions." });
    }

    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      console.warn(`⚠️ No question found with ID: ${req.params.id}`);
      return res.status(404).json({ message: "Question not found" });
    }

    // 🧹 Collect all Cloudinary image URLs to delete
    const urlsToDelete = [];

    if (deletedQuestion.content?.image) urlsToDelete.push(deletedQuestion.content.image);

    deletedQuestion.correct_answers?.forEach((ans) => {
      if (ans.image) urlsToDelete.push(ans.image);
    });

    deletedQuestion.solution_steps?.forEach((step) => {
      if (step.image) urlsToDelete.push(step.image);
    });

    // 🗑️ Delete all Cloudinary images
    for (const url of urlsToDelete) {
      if (url.includes("res.cloudinary.com")) {
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) {
          await deleteImageFromCloudinary(publicId);
          console.log(`🗑️ Cloudinary image deleted: ${publicId}`);
        } else {
          console.log("⚠️ Failed to extract public_id for:", url);
        }
      }
    }

    myCache.del(req.params.id);
    console.log(`🗑️ Question removed from cache. Question ID: ${req.params.id}`);

    res.status(200).json({ message: "Question and related images deleted successfully" });
  } catch (error) {
    console.error("❌ Error while deleting question:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// 📌 עריכת שאלה
exports.editQuestion = async (req, res) => {
  try {
    console.log(`🔵 Attempt to edit question started. Question ID: ${req.params.id}`);

    const {
      content,
      correct_answers,
      solution_steps
    } = req.body;

    // ולידציה על content (חובה לפחות טקסט או תמונה)
    if (!content || (!content.text && !content.image)) {
      console.warn("⚠️ Invalid content: Missing text or image");
      return res.status(400).json({ message: "Question must have at least text or image content." });
    }

    // ולידציה על correct_answers
    if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
      console.warn("⚠️ No correct answers provided");
      return res.status(400).json({ message: "At least one correct answer is required." });
    }

    for (const answer of correct_answers) {
      if (!["text", "image", "text+image"].includes(answer.type)) {
      console.warn(`⚠️ Invalid answer type: ${answer.type}`);
        return res.status(400).json({ message: "Each answer must have a valid type (text, image, or text+image)." });
      }
      if (answer.type === "text" && !answer.text) {
        console.warn("⚠️ Answer of type 'text' missing text content");
        return res.status(400).json({ message: "Answer of type 'text' must include text." });
      }
      if (answer.type === "image" && !answer.image) {
        console.warn("⚠️ Answer of type 'image' missing image URL");
        return res.status(400).json({ message: "Answer of type 'image' must include image." });
      }
      if (answer.type === "text+image" && (!answer.text || !answer.image)) {
        console.warn("⚠️ Answer of type 'text+image' missing text or image");
        return res.status(400).json({ message: "Answer of type 'text+image' must include both text and image." });
      }
    }

    // ולידציה על solution_steps (אם קיימים)
    if (solution_steps && Array.isArray(solution_steps)) {
      for (const step of solution_steps) {
        if (!["text", "image", "text+image"].includes(step.type)) {
        console.warn(`⚠️ Invalid solution step type: ${step.type}`);
          return res.status(400).json({ message: "Each solution step must have a valid type (text, image, or text+image)." });
        }
        if (step.type === "text" && !step.text) {
          console.warn("⚠️ Solution step of type 'text' missing text content");
          return res.status(400).json({ message: "Solution step of type 'text' must include text." });
        }
        if (step.type === "image" && !step.image) {
          console.warn("⚠️ Solution step of type 'image' missing image URL");
          return res.status(400).json({ message: "Solution step of type 'image' must include image." });
        }
        if (step.type === "text+image" && (!step.text || !step.image)) {
          console.warn("⚠️ Solution step of type 'text+image' missing text or image");
          return res.status(400).json({ message: "Solution step of type 'text+image' must include both text and image." });
        }
      }
    }

    // עדכון בפועל
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedQuestion) {
    console.warn(`⚠️ No question found with ID: ${req.params.id}`);
      return res.status(404).json({ message: "Question not found" });
    }

    myCache.set(req.params.id, updatedQuestion);
    console.log(`✅ Question updated successfully. Question ID: ${req.params.id}`);
    console.log(`📦 Cache updated for question ID: ${req.params.id}`);

    res.status(200).json(updatedQuestion);

  } catch (error) {
    console.error("❌ Error while editing question:", error.message);
    res.status(500).json({ error: error.message });
  }
};


exports.getAllUnapprovedQuestions = async (req, res) => {
  try {
    const cacheKey = "unapprovedQuestions";
    console.log("🔵 Attempting to fetch unapproved questions.");

    // Check cache first
    const cachedQuestions = myCache.get(cacheKey);
    if (cachedQuestions) {
      console.log("✅ Unapproved questions found in cache.");
      return res.status(200).json(cachedQuestions);
    }

    console.log("ℹ️ Unapproved questions not found in cache. Fetching from database...");

    // Fetch from DB if not in cache
    const unapprovedQuestions = await Question.find({ status: false });

    if (!unapprovedQuestions || unapprovedQuestions.length === 0) {
      console.warn("⚠️ No unapproved questions found in database.");
      return res.status(404).json({ message: "No unapproved questions found" });
    }

    // Clean the data
    const cleanedQuestions = unapprovedQuestions.map((question) => ({
      _id: question._id,
      question_id: question.question_id,
      title: question.title,
      content: question.content,
      image: question.image,
      media_url: question.media_url,
      hints: question.hints,
      correct_answers: question.correct_answers,
      solution_steps: question.solution_steps,
      status: question.status,
      tags: question.tags,
      subject: question.subject,
      subject_id: question.subject_id,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }));

    // Save to cache
    myCache.set(cacheKey, cleanedQuestions);
    console.log("📦 Unapproved questions cached successfully.");

    res.status(200).json(cleanedQuestions);
  } catch (error) {
    console.error("❌ Error while fetching unapproved questions:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 קבלת שאלה לפי ID
exports.getAllApprovedQuestions = async (req, res) => {
  try {
    const cacheKey = "approvedQuestions";
    console.log("🔵 Attempting to fetch approved questions.");

    // Check cache first
    const cachedQuestions = myCache.get(cacheKey);
    if (cachedQuestions) {
      console.log("✅ Approved questions found in cache.");
      return res.status(200).json(cachedQuestions);
    }

    console.log("ℹ️ Approved questions not found in cache. Fetching from database...");

    // Fetch from DB if not in cache
    const approvedQuestions = await Question.find({ status: true });

    if (!approvedQuestions || approvedQuestions.length === 0) {
      console.warn("⚠️ No approved questions found in database.");
      return res.status(404).json({ message: "No approved questions found" });
    }

    // Clean the data
    const cleanedQuestions = approvedQuestions.map((question) => ({
      _id: question._id,
      title: question.title,
      content: question.content,
      image: question.image,
      media_url: question.media_url,
      hints: question.hints,
      correct_answers: question.correct_answers,
      solution_steps: question.solution_steps,
      status: question.status,
      tags: question.tags,
      subject: question.subject,
      subject_id: question.subject_id,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }));

    // Save to cache
    myCache.set(cacheKey, cleanedQuestions);
    console.log("📦 Approved questions cached successfully.");

    res.status(200).json(cleanedQuestions);
  } catch (error) {
    console.error("❌ Error while fetching approved questions:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// 📌 הצגת רמז
exports.giveHint = async (req, res) => {
  try {
    console.log(`🔵 Attempt to give hint started. Question ID: ${req.params.id}, Hint Index: ${req.params.hintIndex}`);

    const question = await Question.findById(req.params.id);
    if (!question) {
      console.warn(`⚠️ No question found with ID: ${req.params.id}`);
      return res.status(404).json({ message: "Question not found" });
    }

    const hintIndex = parseInt(req.params.hintIndex, 10);

    if (isNaN(hintIndex)) {
      console.warn(`⚠️ Invalid hint index provided: ${req.params.hintIndex}`);
      return res.status(400).json({ message: "Invalid hint index" });
    }

    if (hintIndex >= question.hints.length || hintIndex < 0) {
      console.warn(`⚠️ Requested hint index ${hintIndex} out of range for question ID: ${req.params.id}`);
      return res.status(400).json({ message: "No more hints available" });
    }

    console.log(`✅ Hint retrieved successfully for question ID: ${req.params.id}, Hint Index: ${hintIndex}`);
    
    res.status(200).json({ hint: question.hints[hintIndex] });
  } catch (error) {
    console.error("❌ Error while giving hint:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// 📌 בדיקת תשובה
exports.testSolution = async (req, res) => {
  try {
    const { answer } = req.body;
    const questionId = req.params.id;

    console.log(`🔵 Attempt to test solution. Question ID: ${questionId}`);

    const question = await Question.findById(questionId);

    if (!question) {
      console.warn(`⚠️ No question found with ID: ${questionId}`);
      return res.status(404).json({ message: "Question not found" });
    }

    if (!answer || typeof answer !== "string") {
      console.warn("⚠️ No answer provided or invalid answer format");
      return res.status(400).json({ message: "Answer must be a non-empty string." });
    }

    // Normalize the provided answer (lowercase, trim spaces)
    const normalizedAnswer = answer.toLowerCase().trim();

    // Check against all correct answers (only where type includes text)
    const isCorrect = question.correct_answers.some(ans => {
      if (ans.type === "text" || ans.type === "text+image") {
        return ans.text && ans.text.toLowerCase().trim() === normalizedAnswer;
      }
      return false;
    });

  console.log(`✅ Answer test completed. Result: ${isCorrect ? "Correct" : "Incorrect"}`);

    res.status(200).json({ isCorrect });

  } catch (error) {
    console.error("❌ Error while testing solution:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 הצגת הפתרון המלא
exports.showSolution = async (req, res) => {
  try {
    console.log(`🔵 Attempt to show solution for question ID: ${req.params.id}`);
    const question = await Question.findById(req.params.id);

    if (!question) {
      console.warn(`⚠️ No question found in database with ID: ${questionId}`);
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      solution: question.solution,           // הפתרון הכללי
      solution_steps: question.solution_steps || [] ,
      correct_answers: question.correct_answers || [] // השלבים המפורטים, ברירת מחדל ריק
    });

    console.log(`✅ Solution steps added successfully to question ID: ${req.params.id}`);
  } catch (error) {
    console.error("❌ Error while fetching solution:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// 📌 מעבר לשאלה הבאה
exports.nextQuestion = async (req, res) => {
  try {
    const currentQuestion = await Question.findById(req.params.id);
    if (!currentQuestion) return res.status(404).json({ message: "Question not found" });

    const nextQuestion = await Question.findOne({ subject: currentQuestion.subject, difficulty: currentQuestion.difficulty, _id: { $ne: currentQuestion._id } });

    if (!nextQuestion) return res.status(404).json({ message: "No more questions available" });

    res.status(200).json(nextQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// 📌 קבלת שאלה לפי ID
exports.getQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    console.log('🔵 Attempt to fetch question started. Question ID: ${questionId}');

    // Check cache
    const cachedQuestion = myCache.get(questionId);
    if (cachedQuestion) {
      console.log('✅ Question found in cache. Question ID: ${questionId}');
      return res.status(200).json(cachedQuestion);
    }

    console.log("ℹ️ Question not found in cache. Fetching from database...");

    // Fetch from DB
    const question = await Question.findById(questionId);

    if (!question) {
      console.warn('⚠️ No question found in database with ID: ${questionId}');
      return res.status(404).json({ message: "Question not found" });
    }

    // Clean data
    const cleanedQuestion = {
      _id: question._id,
      title: question.title,
      content: question.content,
      image: question.image,
      media_url: question.media_url,
      hints: question.hints,
      correct_answers: question.correct_answers,
      solution_steps: question.solution_steps,
      status: question.status,
      tags: question.tags,
      subject: question.subject,
      subject_id: question.subject_id,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };

    // Save to cache
    myCache.set(questionId, cleanedQuestion);
    console.log('📦 Question cached successfully. Question ID: ${questionId}');

    res.status(200).json(cleanedQuestion);
  } catch (error) {
    console.error("❌ Error while fetching question:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;

    // מחפשים שאלות שמכילות את התג המדויק (case sensitive!)
    const questions = await Question.find({ tags: tag });

    res.status(200).json(questions);
  } catch (error) {
    console.error('❌ Error fetching questions by tag:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 אישור שאלה
exports.approveQuestion = async (req, res) => {
  try {
    console.log("✅ Request received at /approve");

    const { questionId, adminId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin" && adminUser.role !== "teacher") {
      return res.status(403).json({ message: "Permission denied. Only admins can approve questions." });
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { question_id: questionId },
      { status: true, approved_by: adminId },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // ✅ Update cache
    myCache.set(updatedQuestion._id.toString(), updatedQuestion);

    const unapprovedQuestions = await Question.find({ status: false });
    const cleanedQuestions = unapprovedQuestions.map((q) => ({
      _id: q._id,
      question_id: q.question_id,
      title: q.title,
      content: q.content,
      image: q.image,
      media_url: q.media_url,
      hints: q.hints,
      correct_answers: q.correct_answers,
      solution_steps: q.solution_steps,
      status: q.status,
      tags: q.tags,
      subject: q.subject,
      subject_id: q.subject_id,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));

    myCache.set("unapprovedQuestions", cleanedQuestions);
    console.log("📦 Cache refreshed for unapproved questions");

    res.status(200).json({ message: "Question approved successfully", updatedQuestion });
  } catch (error) {
    console.error("❌ Error approving question:", error);
    res.status(500).json({ error: error.message });
  }
}


// 📌 קבלת שאלות לפי subject_id
exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // נוודא שמזהה חוקי
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid subject ID format" });
    }

    const objectId = new mongoose.Types.ObjectId(subjectId);

  const questions = await Question.find({
    $and: [
      {
        $or: [
          { subject_id: subjectId },
          { subject_id: new mongoose.Types.ObjectId(subjectId) }
        ]
      },
      { status: true }
    ]
  });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 הוספת דרכי פתרון (Solution Steps) לשאלה קיימת
exports.addSolutionSteps = async (req, res) => {
  try {
    console.log('🔵 Attempt to add solution steps. Question ID: ${req.params.id}');

    const { solution_steps } = req.body;

    // ולידציה בסיסית
    if (!solution_steps || !Array.isArray(solution_steps) || solution_steps.length === 0) {
      console.warn("⚠️ No solution steps provided or invalid format");
      return res.status(400).json({ message: "Solution steps must be a non-empty array." });
    }

    // ולידציה על כל שלב פתרון
    for (const step of solution_steps) {
      if (!["text", "image", "text+image"].includes(step.type)) {
        console.warn('⚠️ Invalid step type: ${step.type}');
        return res.status(400).json({ message: "Each solution step must have a valid type (text, image, or text+image)." });
      }
      if (step.type === "text" && !step.text) {
        console.warn("⚠️ Solution step of type 'text' missing text content");
        return res.status(400).json({ message: "Solution step of type 'text' must include text." });
      }
      if (step.type === "image" && !step.image) {
        console.warn("⚠️ Solution step of type 'image' missing image URL");
        return res.status(400).json({ message: "Solution step of type 'image' must include image." });
      }
      if (step.type === "text+image" && (!step.text || !step.image)) {
        console.warn("⚠️ Solution step of type 'text+image' missing text or image");
        return res.status(400).json({ message: "Solution step of type 'text+image' must include both text and image." });
      }
    }

    // שליפת השאלה
    const question = await Question.findById(req.params.id);

    if (!question) {
      console.warn('⚠️ No question found with ID: ${req.params.id}');
      return res.status(404).json({ message: "Question not found" });
    }

    // הוספת דרכי הפתרון
    question.solution_steps = solution_steps;
    await question.save();

    console.log('✅ Solution steps added successfully to question ID: ${req.params.id}');

    res.status(200).json({ message: "Solution steps updated successfully", solution_steps: question.solution_steps });

  } catch (error) {
    console.error("❌ Error while adding solution steps:", error.message);
    res.status(500).json({ error: error.message });
  }
};