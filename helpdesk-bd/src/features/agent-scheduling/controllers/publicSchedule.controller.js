const publicScheduleService = require("../services/publicSchedule.service");
const holdSlotService = require("../services/holdSlot.service");
const bookingService = require("../services/booking.service");

const getPublicSchedule = async (req, res) => {
  try {
    const { token } = req.params;
    const { date } = req.query;

    const schedule = await publicScheduleService.getPublicSchedule(token, date);

    return res.status(200).json({
      success: true,
      message: "Public schedule fetched successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Get public schedule error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch public schedule",
    });
  }
};

const holdSlot = async (req, res) => {
  try {
    const { token } = req.params;
    const { slot_id } = req.body;

    // Validate slot_id
    if (!slot_id) {
      return res.status(400).json({
        success: false,
        message: "slot_id is required",
      });
    }

    const result = await holdSlotService.holdSlot(token, slot_id);

    return res.status(201).json({
      success: true,
      message: "Slot held successfully",
      data: result,
    });
  } catch (error) {
    console.error("Hold slot error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to hold slot",
    });
  }
};

//slot booking
const bookSlot = async (req, res, next) => {
  try {
    const { token } = req.params;

    const { sessionToken, customerName, customerEmail, customerPhone, notes } =
      req.body;

    const result = await bookingService.bookSlot({
      publicToken: token,
      sessionToken,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Meeting booked successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const { token, bookingId } = req.params;

    const result = await bookingService.getBookingDetails({
      publicToken: token,
      bookingId,
    });

    return res.status(200).json({
      success: true,
      message: "Booking details retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSchedule,
  holdSlot,
  bookSlot,
  getBookingDetails,
};
