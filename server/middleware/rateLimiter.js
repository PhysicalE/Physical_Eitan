const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");

const myCache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 120 }); // TTL של 15 דקות (900 שניות)

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 10, // מקסימום 5 ניסיונות
  message: { message: "Too many login attempts. Please try again later." },
  headers: true,

  skipFailedRequests: false, 
  store: {
    incr: (key, cb) => {
      let current = myCache.get(key) || 0;
      current++;
      myCache.set(key, current);
      cb(null, current); 
    },
    resetKey: (key) => {
      myCache.del(key); 
    },
    ttl: 15 * 60 // זמן קיום של 15 דקות (TTL)
  }
});

module.exports = { loginLimiter };
