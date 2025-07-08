const myCache = require("../utils/cache"); // ייבוא הקאש
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// 📌 הרשמת משתמש חדש (Signup)
exports.signup = async (req, res) => {
  try {
    console.log("🔵 Signup attempt started");

    const { first_name, last_name, email, password, requested_role } = req.body;
    console.log(`📨 Received signup request for email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`⚠️ User already exists with email: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔒 Password hashed successfully");

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'student', // ✅ תמיד סטודנט בהתחלה
      requested_role: requested_role === 'teacher' ? 'teacher' : undefined
    });

    console.log(`✅ New user registered successfully. User ID: ${newUser._id}`);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: newUser
    });
  } catch (error) {
    console.error("❌ Error during signup:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 שליפת בקשות מורה
exports.getTeacherRequests = async (req, res) => {
  try {
    const requests = await User.find({ requested_role: 'teacher' }).select('-password');
    res.status(200).json(requests);
  } catch (error) {
    console.error("❌ Error fetching teacher requests:", error.message);
    res.status(500).json({ message: 'Failed to fetch teacher requests' });
  }
};
// 📌 אישור בקשת מורה
exports.approveTeacher = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id; // מגיע מה־verifyToken

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role: 'teacher',
        approved_by: adminId,
        $unset: { requested_role: "" } // מסיר את השדה לחלוטין מהמסמך
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Teacher approved', user: updatedUser });
  } catch (error) {
    console.error("❌ Error approving teacher:", error.message);
    res.status(500).json({ message: 'Failed to approve teacher' });
  }
};


// 📌 כניסת משתמש (Signin)
exports.signin = async (req, res) => {
  try {
    console.log("🔵 Signin attempt started");

    const { email, password } = req.body;
    console.log(`📨 Received credentials for email: ${email}`);

    // חיפוש המשתמש במסד הנתונים
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`⚠️ No user found with email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // השוואת סיסמאות
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`⚠️ Invalid password attempt for email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // יצירת טוקן `JWT`
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // 🔹 הטוקן תקף לשעה
    );

    console.log(`✅ Login successful for user ID: ${user._id}`);

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("❌ Error during signin:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 שינוי סיסמה (changePassword)
exports.changePassword = async (req, res) => {
  try {
    console.log("🔵 Password change attempt started");

    const { email, oldPassword, newPassword } = req.body;
    console.log(`📨 Received password change request for email: ${email}`);

    // בדוק אם המשתמש כבר בקאש
    let cachedUser = myCache.get(email);
    if (!cachedUser) {
      console.log("ℹ️ User not found in cache. Fetching from database...");
      cachedUser = await User.findOne({ email });
      if (cachedUser) {
        myCache.set(email, cachedUser);
        console.log("📦 User cached successfully after DB fetch");
      }
    } else {
      console.log("✅ User found in cache");
    }

    if (!cachedUser) {
      console.warn(`⚠️ No user found with email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, cachedUser.password);
    if (!isMatch) {
      console.warn(`⚠️ Incorrect old password provided for email: ${email}`);
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    cachedUser.password = await bcrypt.hash(newPassword, 10);
    await cachedUser.save();
    console.log(`🔒 Password updated successfully for user ID: ${cachedUser._id}`);

    myCache.set(email, cachedUser); // עדכון בקאש
    console.log("📦 Cache updated with new password");

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error during password change:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 שחזור סיסמה (recoverPassword)
exports.recoverPassword = async (req, res) => {
  try {
    console.log("🔵 Password recovery attempt started");

    const { email } = req.body;
    console.log(`📨 Received password recovery request for email: ${email}`);

    // בדיקה אם המשתמש נמצא בקאש
    let cachedUser = myCache.get(email);
    if (cachedUser) {
      console.log("✅ User found in cache");
    } else {
      console.log("ℹ️ User not found in cache. Fetching from database...");
      cachedUser = await User.findOne({ email });
      if (cachedUser) {
        myCache.set(email, cachedUser); // שמירה בקאש
        console.log("📦 User cached successfully after DB fetch");
      }
    }

    if (!cachedUser) {
      console.warn(`⚠️ No user found with email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // **כאן בעתיד נשלב שליחת מייל אמיתי לשחזור סיסמה**
    console.log(`📧 Password recovery email (mock) prepared for user ID: ${cachedUser._id}`);

    res.status(200).json({ message: "Password recovery email sent (Mock)" });
  } catch (error) {
    console.error("❌ Error during password recovery:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 שינוי כתובת אימייל (changeEmail)
exports.changeEmail = async (req, res) => {
  try {
    console.log("🔵 Email change attempt started");

    const { oldEmail, newEmail } = req.body;
    console.log(`📨 Received email change request: from ${oldEmail} to ${newEmail}`);

    // בדיקה אם המשתמש נמצא בקאש
    let cachedUser = myCache.get(oldEmail);
    if (cachedUser) {
      console.log("✅ User found in cache with old email");
    } else {
      console.log("ℹ️ User not found in cache. Fetching from database...");
      cachedUser = await User.findOne({ email: oldEmail });
      if (cachedUser) {
        myCache.set(oldEmail, cachedUser);
        console.log("📦 User cached successfully after DB fetch");
      }
    }

    if (!cachedUser) {
      console.warn(`⚠️ No user found with old email: ${oldEmail}`);
      return res.status(404).json({ message: "User not found" });
    }

    cachedUser.email = newEmail;
    await cachedUser.save();
    console.log(`✅ Email updated successfully for user ID: ${cachedUser._id}`);

    // עדכון הקאש
    myCache.del(oldEmail);
    console.log(`🗑️ Old email (${oldEmail}) removed from cache`);
    myCache.set(newEmail, cachedUser);
    console.log(`📦 New email (${newEmail}) cached successfully`);

    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("❌ Error during email change:", error.message);
    res.status(500).json({ error: error.message });
  }
};

