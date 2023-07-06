const express = require("express");
const router = express.Router();
const {register, login} = require("../Controllers/auth")

router.route("^/$|/register(.html)?").post(register);
router.route("^/$|/login(.html)?").post(login);

module.exports = router;
