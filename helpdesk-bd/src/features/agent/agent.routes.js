const express = require("express");

const router = express.Router();

const agentController = require("./agent.controller");

const authMiddleware = require("../../middleware/authmiddleware");
const authorizeRoles = require("../../middleware/authorizeRoles");

// Get tickets assigned to the authenticated agent
router.get(
  "/tickets",
  authMiddleware,
  authorizeRoles("AGENT"),
  agentController.getAgentTickets,
);

// Get a single ticket by id
router.get(
  "/tickets/:id",
  authMiddleware,
  authorizeRoles("AGENT"),
  agentController.getAgentTicketById
);

// Update status of an assigned ticket
router.patch(
  "/tickets/:id/status",
  authMiddleware,
  authorizeRoles("AGENT"),
  agentController.updateTicketStatus
);

module.exports = router;
