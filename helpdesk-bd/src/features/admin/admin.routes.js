const express = require("express");

const router = express.Router();

const adminController = require("./admin.controller");

const authMiddleware = require("../../middleware/authmiddleware");
const authorizeRoles = require("../../middleware/authorizeRoles");

// Create Agent
router.post(
  "/agents",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.createAgent,
);

// router.post("/test-email", adminController.testEmail);

module.exports = router;
