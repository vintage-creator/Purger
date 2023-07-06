const isVerified = require("../Middlewares/verifyToken");
const express = require("express");
const router = express.Router();
const {createConfig, getConfig, getAConfig, updateAConfig, deleteAConfig} = require("../Controllers/cleanupConfig");

//Create & get all configuration files 
router.route("/config(.html)?").post(isVerified, createConfig).get(isVerified, getConfig);

//Get, update & delete a configuration file
router.route("/config(.html)?/:id").get(isVerified, getAConfig).put(isVerified, updateAConfig).delete(isVerified, deleteAConfig);

module.exports = router;

