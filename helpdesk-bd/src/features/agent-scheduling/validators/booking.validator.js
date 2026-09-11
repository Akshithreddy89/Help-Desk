const {
  MeetingLink,
  AgentAvailability,
  AvailabilitySlot,
  BookingSession,
} = require("../../../models");

const validateCustomerInfo = (customerName, customerEmail, customerPhone) => {
  if (!customerName || !customerName.trim()) {
    const error = new Error("Customer name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!customerEmail || !customerEmail.trim()) {
    const error = new Error("Customer email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!customerPhone || !customerPhone.trim()) {
    const error = new Error("Customer phone is required");
    error.statusCode = 400;
    throw error;
  }
};

const validateBookingRequirements = async (
  publicToken,
  sessionToken,
  transaction
) => {
  const meetingLink = await MeetingLink.findOne({
    where: {
      public_token: publicToken,
      status: "Active",
    },
    transaction,
  });

  if (!meetingLink) {
    const error = new Error("Invalid or inactive schedule link");
    error.statusCode = 404;
    throw error;
  }

  const bookingSession = await BookingSession.findOne({
    where: {
      session_token: sessionToken,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!bookingSession) {
    const error = new Error("Invalid booking session");
    error.statusCode = 404;
    throw error;
  }

  if (bookingSession.status !== "Active") {
    const error = new Error("Booking session is no longer active");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();

  if (
    !bookingSession.held_until ||
    new Date(bookingSession.held_until) <= now
  ) {
    const error = new Error("Booking session has expired");
    error.statusCode = 410;
    throw error;
  }

  const slot = await AvailabilitySlot.findByPk(bookingSession.slot_id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!slot) {
    const error = new Error("Slot not found");
    error.statusCode = 404;
    throw error;
  }

  const availability = await AgentAvailability.findByPk(slot.availability_id, {
    transaction,
  });

  if (!availability) {
    const error = new Error("Availability not found");
    error.statusCode = 404;
    throw error;
  }

  if (availability.agent_id !== meetingLink.agent_id) {
    const error = new Error("Slot does not belong to this schedule");
    error.statusCode = 403;
    throw error;
  }

  if (slot.status !== "Held") {
    const error = new Error("Slot is no longer held");
    error.statusCode = 409;
    throw error;
  }

  if (!slot.held_until || new Date(slot.held_until) <= now) {
    const error = new Error("Slot hold has expired");
    error.statusCode = 410;
    throw error;
  }

  return { meetingLink, bookingSession, slot, availability };
};

const validateGetBookingDetails = async (publicToken) => {
  const meetingLink = await MeetingLink.findOne({
    where: {
      public_token: publicToken,
      status: "Active",
    },
  });

  if (!meetingLink) {
    const error = new Error("Invalid or inactive schedule link");
    error.statusCode = 404;
    throw error;
  }

  return { meetingLink };
};

module.exports = {
  validateCustomerInfo,
  validateBookingRequirements,
  validateGetBookingDetails,
};
