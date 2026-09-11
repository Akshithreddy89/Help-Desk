const { Op } = require("sequelize");
const { MeetingBooking } = require("../../../models");

const getCalendar = async ({ agentId, startDate, endDate }) => {
  const where = {
    agent_id: agentId,
  };

  // If frontend provides date range
  if (startDate && endDate) {
    where.meeting_date = {
      [Op.between]: [startDate, endDate],
    };
  }

  const bookings = await MeetingBooking.findAll({
    where,

    order: [
      ["meeting_date", "ASC"],
      ["start_time", "ASC"],
    ],

    attributes: [
      "id",
      "agent_id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "status",
      "meeting_date",
      "start_time",
      "end_time",
      "booking_reference",
    ],
  });

  return bookings;
};

const getCalendarBooking = async ({ agentId, bookingId }) => {
  const booking = await MeetingBooking.findOne({
    where: {
      id: bookingId,
      agent_id: agentId,
    },

    attributes: [
      "id",
      "slot_id",
      "agent_id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "status",
      "meeting_date",
      "start_time",
      "end_time",
      "booking_reference",
    ],
  });

  if (!booking) {
    const error = new Error("Booking not found");

    error.statusCode = 404;

    throw error;
  }

  return booking;
};

module.exports = { getCalendar, getCalendarBooking };
