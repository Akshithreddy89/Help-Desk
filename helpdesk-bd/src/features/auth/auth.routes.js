const express = require("express");

const router = express.Router();

const authController = require("./auth.controller");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/set-password", authController.setPassword);

module.exports = router;
