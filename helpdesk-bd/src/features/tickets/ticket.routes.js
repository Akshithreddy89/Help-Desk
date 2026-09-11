const express = require("express");
const router = express.Router();
const ticketController = require("./tickets.controller");
const authMiddleware = require("../../middleware/authmiddleware");
const authorizeRoles = require("../../middleware/authorizeRoles");

// Customers can create tickets
router.post(
  "/",
  authMiddleware,
  authorizeRoles("CUSTOMER"), 
  ticketController.createTicket
);

// Customers can get their tickets
router.get(
  "/",
  authMiddleware,
  authorizeRoles("CUSTOMER"), 
  ticketController.getCustomerTickets
);

// Customers can get a single ticket by id
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("CUSTOMER"),
  ticketController.getTicketById
);

module.exports = router;
