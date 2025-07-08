const myCache = require("../utils/cache"); 
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const {
  signup,
  signin,
  changePassword,
  recoverPassword,
  changeEmail,
  getTeacherRequests,
  approveTeacher
} = require("../controllers/userController");
const { loginLimiter } = require("../middleware/rateLimiter");

router.post("/signup", signup);
router.post("/signin", loginLimiter, signin);
router.post("/changePassword", async (req, res, next) => {
  try {
    const { email } = req.body;
    let cachedUser = myCache.get(email);
    if (cachedUser) {
      console.log("Returning user from cache...");
    } else {
      cachedUser = await User.findOne({ email });
      if (cachedUser) {
        myCache.set(email, cachedUser); 
      }
    }

    if (!cachedUser) return res.status(404).json({ message: "User not found" });

    await changePassword(req, res);
  } catch (error) {
    next(error); // הפניית השגיאה הלאה
  }
});

// שליפת כל הבקשות
router.get("/admin/teacher-requests", verifyToken, verifyAdmin, getTeacherRequests);

// אישור בקשה בידי אדמין
router.put("/admin/approve-teacher/:userId", verifyToken, verifyAdmin, approveTeacher);

router.post("/recoverPassword", async (req, res, next) => {
  try {
    const { email } = req.body;
    let cachedUser = myCache.get(email);
    if (cachedUser) {
      console.log("Returning user from cache...");
    } else {
      cachedUser = await User.findOne({ email });
      if (cachedUser) {
        myCache.set(email, cachedUser); // שמירה בקאש אם לא קיים
      }
    }

    if (!cachedUser) return res.status(404).json({ message: "User not found" });

    await recoverPassword(req, res); 
  } catch (error) {
    next(error); 
  }
});

router.post("/changeEmail", async (req, res, next) => {
  try {
    const { oldEmail } = req.body;
    let cachedUser = myCache.get(oldEmail);
    if (cachedUser) {
      console.log("Returning user from cache...");
    } else {
      cachedUser = await User.findOne({ email: oldEmail });
      if (cachedUser) {
        myCache.set(oldEmail, cachedUser); 
      }
    }

    if (!cachedUser) return res.status(404).json({ message: "User not found" });

    await changeEmail(req, res); 
  } catch (error) {
    next(error); 
  }
});
// 📌 Get current user (authenticated)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error in /api/users/me:", err);
    res.status(500).json({ message: "Server error while fetching user" });
  }
});


module.exports = router;
