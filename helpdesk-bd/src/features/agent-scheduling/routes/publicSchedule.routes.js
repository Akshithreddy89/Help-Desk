const express = require("express");

const router = express.Router();

const {
  getPublicSchedule,
  holdSlot,
  bookSlot,
  getBookingDetails,
} = require("../controllers/publicSchedule.controller");

// Public API
router.get("/schedule/:token", getPublicSchedule);
router.post("/schedule/:token/hold", holdSlot);
router.post("/schedule/:token/book", bookSlot);
router.get("/schedule/:token/bookings/:bookingId", getBookingDetails);

module.exports = router;
