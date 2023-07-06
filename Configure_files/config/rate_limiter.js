const RateLimiter = require("express-rate-limit");

const rateLimiter = RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    });

    module.exports = rateLimiter;