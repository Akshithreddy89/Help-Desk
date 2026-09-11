const calendarService = require("../services/calendar.service");

const getCalendar = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    const { startDate, endDate } = req.query;

    const result = await calendarService.getCalendar({
      agentId,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Calendar data retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCalendarBooking = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    const { id } = req.params;

    const result = await calendarService.getCalendarBooking({
      agentId,
      bookingId: id,
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

module.exports = { getCalendar, getCalendarBooking };
