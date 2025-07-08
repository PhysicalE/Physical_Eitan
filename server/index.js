require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// יצירת אפליקציית Express
const app = express();

// הגדרת מקורות מורשים לגישת CORS
const allowedOrigins = [
  'https://physical-eitan.vercel.app', // פרונט Production
  'https://physical-eitan-o3qw.vercel.app',     // preview/deployment
  'http://localhost:3000'              // פיתוח מקומי
];

// קונפיגורציית CORS כללית
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // מאפשר קריאות ללא origin (כמו Postman)
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.app.github.dev')
    ) {
      console.log("✅ CORS allowed for:", origin);
      return callback(null, true);
    }
    console.log("❌ CORS blocked for:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// שימוש ב־CORS
app.use(cors(corsOptions));

// טיפול ייעודי בבקשות Preflight
app.options("*", cors(corsOptions));

// תומך ב־JSON בגוף הבקשה
app.use(express.json());

// התחברות ל־MongoDB
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

// ייצוא ל־Vercel Serverless
module.exports = app;
