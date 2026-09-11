const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availability.controller");
const authMiddleware = require("../../../middleware/authmiddleware");
const authorizeRoles = require("../../../middleware/authorizeRoles");

// All routes here should be protected and only accessible by AGENT
router.use(authMiddleware);
router.use(authorizeRoles("AGENT")); // Assuming 'AGENT' is the role string, check if it's 'Agent' or 'AGENT'

// POST /api/agent/availabilities
router.post("/", availabilityController.createAvailability);

// GET /api/agent/availabilities
router.get("/", availabilityController.getAvailabilities);

module.exports = router;
