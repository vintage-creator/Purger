const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersDB = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  id: {
    type: String,
    default: null
  },
  role: {
    type: String,
    default: "user",
  },
});

const UserReg = mongoose.model("UserReg", usersDB);
module.exports = UserReg;
