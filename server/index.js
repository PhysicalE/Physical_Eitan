require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// יצירת אפליקציה של Express
const app = express();

// הגדרת מקורות מורשים לגישת CORS
const allowedOrigins = [
  'https://physical-eitan.vercel.app', // פרונט בפרודקשן
  'http://localhost:3000'              // פיתוח מקומי
];

// קונפיגורציית CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // מאפשר לקוחות ללא origin (כמו Postman)
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.app.github.dev')
    ) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// תומך ב-JSON בבקשות
app.use(express.json());

// התחברות למסד הנתונים
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// נתיבי API
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);

// ייצוא האפליקציה ל־Vercel
module.exports = app;
