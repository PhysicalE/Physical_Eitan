require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http"); // 👈 עטיפה ל־Vercel

// יצירת אפליקציית Express
const app = express();

// מקורות מורשים
const allowedOrigins = [
  'https://physical-eitan.vercel.app', // פרונט Production
  'https://physical-eitan-o3qw.vercel.app', // Preview של Vercel
  'http://localhost:3000', // פיתוח מקומי
  'https://server-l0bb5psry-physicales-projects.vercel.app'
];


// הגדרת CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.app.github.dev')
    )
 {
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

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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

// ייצוא מתאים ל־Vercel Serverless
module.exports = app;                      // שורת חובה ל־Express רגיל
module.exports.handler = serverless(app);
