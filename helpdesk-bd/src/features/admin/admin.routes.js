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

// Get All Agents
router.get(
  "/agents",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getAllAgents,
);

// router.post("/test-email", adminController.testEmail);

// Get All Tickets (Admin only)
router.get(
  "/tickets",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getAllTickets,
);

// Assign a Ticket to an Agent (Admin only)
router.patch(
  "/tickets/:id/assign",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.assignTicket,
);

module.exports = router;
