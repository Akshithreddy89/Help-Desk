const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slot.controller");
const authMiddleware = require("../../../middleware/authmiddleware");
const authorizeRoles = require("../../../middleware/authorizeRoles");

// All routes here should be protected and only accessible by AGENT
router.use(authMiddleware);
router.use(authorizeRoles("AGENT"));

// GET /api/agent/slots
router.get("/", slotController.getSlots);

module.exports = router;
