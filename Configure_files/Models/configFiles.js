const mongoose = require("mongoose");
const { Schema } = mongoose;

const configFiles = new Schema({
  Directory_Path: {
    type: String,
    required: true,
  },
  Files_to_Clean: {
    type: String,
    required: true,
  },
  Files_to_Exempt: {
    type: String,
  },
  Schedule: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserReg",
  },
});

const cleanUp = mongoose.model("cleanUp", configFiles);
module.exports = cleanUp;
