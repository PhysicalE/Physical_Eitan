const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });  // TTL של 24 שעות (86400 שניות)

module.exports = myCache;
