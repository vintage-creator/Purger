const UserReg = require("../Models/userReg.js");
const Jwt = require("jsonwebtoken");

const isVerified = async (req, res, next) => {
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.includes("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decode = Jwt.verify(token, process.env.Token_secret);
        const user = await UserReg.findOne({ id: decode.payload });
        req.user = user;
       
        next();
      } catch (err) {
        res.status(401).json({
          status: "failed",
          message: err.message,
        });
      }
    } else {
      res.status(406).json({
        status: "failed",
        message: "No token",
      });
    }
  };

  module.exports = isVerified;