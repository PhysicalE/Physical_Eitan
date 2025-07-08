require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// יצירת אפליקציה של Express
const app = express();


const allowedOrigins = [
  'https://physical-eitan.vercel.app', // פרונט בפרודקשן
  'http://localhost:3000'        // פיתוח מקומי
  
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser clients
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
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// הגדרת נתיבי API
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);



app.options("*", cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.app.github.dev')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));


// הפעלת השרת
module.exports = app;