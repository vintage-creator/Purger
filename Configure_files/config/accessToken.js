const jwt = require("jsonwebtoken");

const accessToken = (payload) => {
    return jwt.sign(
    {payload}, process.env.Token_Secret, {expiresIn: "2hr"}
    );
};
module.exports = accessToken;
