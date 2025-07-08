require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

// יצירת אפליקציית Express
const app = express();

// מקורות מורשים
const allowedOrigins = [
  'https://physical-eitan.vercel.app',
  'https://physical-eitan-o3qw.vercel.app',
  'http://localhost:3000',
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
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// טיפול מפורש ב-preflight requests
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    console.log("✅ OPTIONS preflight handled for:", origin);
    return res.status(200).end();
  }
  
  console.log("❌ OPTIONS preflight blocked for:", origin);
  return res.status(403).end();
});

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

// ❌ הסרת חיבור MongoDB מכאן - נעביר לכל route בנפרד
// mongoose.connect() כאן גורם לטיימאוט!

// נתיב בדיקת בריאות - ללא MongoDB
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    message: 'Server is running without MongoDB connection'
  });
});

// פונקציה לחיבור MongoDB עם טיימאוט
async function connectToMongoDB() {
  if (mongoose.connection.readyState === 1) {
    return; // כבר מחובר
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 שניות במקום 300
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}

// Middleware לחיבור MongoDB רק לנתיבי API שצריכים אותו
const requireMongoDB = async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
};

// נתיבי API עם חיבור MongoDB
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", requireMongoDB, questionRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", requireMongoDB, userRoutes);

const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", requireMongoDB, subjectRoutes);

// נתיב ברירת מחדל
app.get('/', (req, res) => {
  res.json({ 
    message: 'Physics School API Server',
    status: 'running',
    endpoints: ['/api/health', '/api/users', '/api/questions', '/api/subjects']
  });
});

// ייצוא מתאים ל־Vercel Serverless
module.exports = serverless(app);