const jwt = require("jsonwebtoken");
const myCache = require("../utils/cache");
const User = require("../models/User"); // חובה להוסיף

exports.verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    console.log("✅ Decoded JWT user payload:", decoded);

    // בדוק אם המשתמש בקאש
    let cachedUser = myCache.get(decoded.id);
    if (cachedUser) {
      console.log("Returning user from cache...");
      req.user = cachedUser;
      return next();
    }

    // אם לא בקאש – שלוף ממסד הנתונים
    const dbUser = await User.findById(decoded.id).select("-password"); // אל תשלוף את הסיסמה
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // שמור בקאש ושלח הלאה
    myCache.set(decoded.id, dbUser);
    req.user = dbUser;
    next();

  } catch (error) {
    console.error("❌ Invalid token:", error.message);
    res.status(400).json({ message: "Invalid Token" });
  }
};


exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied. Only admins can perform this action." });
  }
  next();
};

exports.verifyAdminOrTeacher = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ message: "Permission denied. Only admins or teachers can delete questions." });
};

exports.verifyTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access Denied. Only teachers can perform this action." });
  }
  next();
};