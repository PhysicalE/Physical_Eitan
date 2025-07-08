require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

// יצירת אפליקציית Express
const app = express();

// מקורות מורשים
const allowedOrigins = [
  'https://physical-eitan-o3qw.vercel.app',
  'https://physical-eitan.vercel.app',
  'http://localhost:3000',
  'https://server-theta-weld.vercel.app'
];

// הגדרת CORS פשוטה יותר
const corsOptions = {
  origin: function (origin, callback) {
    // אפשר requests ללא origin
    if (!origin) return callback(null, true);
    
    // בדיקה בטוחה יותר
    try {
      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS allowed for:", origin);
        return callback(null, true);
      }
      
      // בדיקה בטוחה לדומיינים של vercel
      if (origin && typeof origin === 'string' && origin.endsWith('.vercel.app')) {
        console.log("✅ CORS allowed for Vercel domain:", origin);
        return callback(null, true);
      }
      
      console.log("❌ CORS blocked for:", origin);
      return callback(new Error("Not allowed by CORS"));
    } catch (error) {
      console.error("CORS error:", error);
      return callback(error);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
};

// הגדרת CORS יחידה
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));

// MongoDB connection with timeout
let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) return;
  
  try {
    // הגדרת timeout קצר יותר
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,  // 5 שניות במקום ברירת מחדל
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
};

// Middleware לחיבור MongoDB
app.use(async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
});

// הוספת timeout global
app.use((req, res, next) => {
  // הגדרת timeout של 25 שניות
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.log("Request timeout for:", req.path);
      return res.status(408).json({ error: 'Request timeout' });
    }
  }, 25000);
  
  // ניקוי timeout כשהתגובה נשלחת
  const originalSend = res.send;
  res.send = function(data) {
    clearTimeout(timeout);
    return originalSend.call(this, data);
  };
  
  next();
});

// נתיבי API
try {
  const questionRoutes = require("./routes/questionRoutes");
  app.use("/api/questions", questionRoutes);

  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);

  const subjectRoutes = require("./routes/subjectRoutes");
  app.use("/api/subjects", subjectRoutes);
  
  console.log("✅ Routes loaded!");
} catch (error) {
  console.error("❌ Error loading routes:", error);
}

// נתיב בדיקת בריאות
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// טיפול בשגיאות
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ייצוא מתאים ל־Vercel Serverless
module.exports = serverless(app);