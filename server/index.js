require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

// יצירת אפליקציית Express
const app = express();

// מקורות מורשים
const allowedOrigins = [
  'https://physical-eitan.vercel.app', // פרונט Production
  'https://physical-eitan-o3qw.vercel.app', // Preview של Vercel
  'http://localhost:3000', // פיתוח מקומי
  'https://server-l0bb5psry-physicales-projects.vercel.app'
];

// הגדרת CORS - גרסה מתוקנת
const corsOptions = {
  origin: function (origin, callback) {
    // אפשר requests ללא origin (כמו Postman או mobile apps)
    if (!origin) return callback(null, true);
    
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
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
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200 // תמיכה בדפדפנים ישנים
};

// הגדרת CORS - סדר חשוב!
app.use(cors(corsOptions));

// טיפול מפורש ב-preflight requests
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    console.log("✅ OPTIONS preflight handled for:", origin);
    return res.status(200).end();
  }
  
  console.log("❌ OPTIONS preflight blocked for:", origin);
  return res.status(403).end();
});

// Middleware נוספים
app.use(express.json());

// הוספת headers לכל response
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

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

// נתיב בדיקת בריאות
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin 
  });
});

// ייצוא מתאים ל־Vercel Serverless
module.exports = serverless(app);