const express = require("express");

const router = express.Router();

const {
  createMeetingLink,
  getMeetingLink,
} = require("../controllers/meetingLink.controller");

const authenticateUser = require("../../../middleware/authmiddleware");
const authorizeRoles = require("../../../middleware/authorizeRoles");

// Create / get agent's meeting link
router.post(
  "/meeting-link",
  authenticateUser,
  authorizeRoles("AGENT"),
  createMeetingLink,
);

router.get(
  "/meeting-link",
  authenticateUser,
  authorizeRoles("AGENT"),
  getMeetingLink,
);

module.exports = router;
