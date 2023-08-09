const redis = require("redis");

let redisClient = redis.createClient({
  password: process.env.Redis_Pass,
  socket: {
    host: process.env.Redis_Host,
    port: process.env.Redis_Port,
  },
});
(async function () {
  await redisClient.connect();
})();
// connect and error events
redisClient.on("error", function (err) {
  console.log("Something went wrong ", err);
});
redisClient.on("connect", function () {
  console.log("Redis Connected!");
});

module.exports = redisClient;