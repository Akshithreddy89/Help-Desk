const express = require("express");

const {
  getCalendar,
  getCalendarBooking,
} = require("../controllers/calendar.controller");

const authenticateUser = require("../../../middleware/authmiddleware");
const authorizeRoles = require("../../../middleware/authorizeRoles");

const router = express.Router();

router.get("/calendar", authenticateUser, authorizeRoles("AGENT"), getCalendar);

router.get(
  "/calendar/:id",
  authenticateUser,
  authorizeRoles("AGENT"),
  getCalendarBooking,
);

module.exports = router;
