const {
  sequelize,
  MeetingLink,
  AgentAvailability,
  AvailabilitySlot,
  BookingSession,
  MeetingBooking,
} = require("../../../models");
const { v4: uuidv4 } = require("uuid");
const {
  validateCustomerInfo,
  validateBookingRequirements,
  validateGetBookingDetails,
} = require("../validators/booking.validator");

const toTimeValue = (dateValue) => {
  const date = new Date(dateValue);
  return date.toTimeString().slice(0, 8);
};

// Book a slot for a customer using public token and session token
const bookSlot = async ({
  publicToken,
  sessionToken,
  customerName,
  customerEmail,
  customerPhone,
  notes,
}) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Validate customer information
    validateCustomerInfo(customerName, customerEmail, customerPhone);

    // 2. Validate booking requirements and fetch related entities
    const { meetingLink, bookingSession, slot, availability } =
      await validateBookingRequirements(publicToken, sessionToken, transaction);

    // --------------------------------------------------
    // 11. Create actual meeting booking
    // --------------------------------------------------

    const booking = await MeetingBooking.create(
      {
        agent_id: meetingLink.agent_id,
        slot_id: slot.id,

        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: customerPhone.trim(),
        meeting_date: availability.availability_date,
        start_time: toTimeValue(slot.start_datetime),
        end_time: toTimeValue(slot.end_datetime),
        booking_reference: `BK-${uuidv4()}`,
        notes: notes ? notes.trim() : null,

        status: "CONFIRMED",
      },
      {
        transaction,
      },
    );

    // --------------------------------------------------
    // 12. Change slot HELD → BOOKED
    // --------------------------------------------------

    slot.status = "Booked";
    slot.held_until = null;

    await slot.save({
      transaction,
    });

    // --------------------------------------------------
    // 13. Complete booking session
    // --------------------------------------------------

    bookingSession.status = "Completed";

    await bookingSession.save({
      transaction,
    });

    // --------------------------------------------------
    // 14. Commit transaction
    // --------------------------------------------------

    await transaction.commit();

    return {
      bookingId: booking.id,
      slotId: slot.id,
      agentId: meetingLink.agent_id,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      notes: booking.notes,
      status: booking.status,
      startDatetime: slot.start_datetime,
      endDatetime: slot.end_datetime,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

//get booking details for a customer using public token and booking ID
const getBookingDetails = async ({ publicToken, bookingId }) => {
  // 1. Validate public schedule token
  const { meetingLink } = await validateGetBookingDetails(publicToken);

  // ---------------------------------------------
  // 2. Find booking
  // ---------------------------------------------

  const booking = await MeetingBooking.findByPk(bookingId, {
    include: [
      {
        model: AvailabilitySlot,
        as: "slot",
        attributes: ["id", "start_datetime", "end_datetime", "status"],
        include: [
          {
            model: AgentAvailability,
            as: "availability",
            attributes: ["id", "agent_id"],
          },
        ],
      },
    ],
  });

  if (!booking) {
    const error = new Error("Booking not found");

    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------------------
  // 3. Verify booking belongs to this agent
  // ---------------------------------------------

  if (booking.agent_id !== meetingLink.agent_id) {
    const error = new Error("Booking does not belong to this schedule");

    error.statusCode = 403;
    throw error;
  }

  // ---------------------------------------------
  // 4. Return customer booking details
  // ---------------------------------------------

  return {
    bookingId: booking.id,

    agent: {
      id: booking.agent_id,
    },

    customer: {
      name: booking.customer_name,
      email: booking.customer_email,
      phone: booking.customer_phone,
    },

    meeting: {
      date: booking.slot
        ? new Date(booking.slot.start_datetime).toISOString().split("T")[0]
        : null,

      startTime: booking.slot
        ? new Date(booking.slot.start_datetime).toISOString()
        : null,

      endTime: booking.slot
        ? new Date(booking.slot.end_datetime).toISOString()
        : null,

      status: booking.status,
    },

    notes: booking.notes,
    bookingReference: booking.booking_reference,
  };
};

module.exports = {
  bookSlot,
  getBookingDetails,
};
