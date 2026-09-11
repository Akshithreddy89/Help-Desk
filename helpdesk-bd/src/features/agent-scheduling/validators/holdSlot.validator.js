const {
  MeetingLink,
  AgentAvailability,
  AvailabilitySlot,
} = require("../../../models");

const validateHoldSlotRequest = async (publicToken, slotId, transaction) => {
  const meetingLink = await MeetingLink.findOne({
    where: {
      public_token: publicToken,
      status: "Active",
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!meetingLink) {
    const error = new Error("Invalid or inactive meeting link");
    error.statusCode = 404;
    throw error;
  }

  const slot = await AvailabilitySlot.findOne({
    where: { id: slotId },
    include: [
      {
        model: AgentAvailability,
        as: "availability",
        where: {
          agent_id: meetingLink.agent_id,
          status: "Active",
        },
        attributes: ["id", "agent_id", "availability_date"],
      },
    ],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!slot) {
    const error = new Error("Slot not found or does not belong to this agent");
    error.statusCode = 404;
    throw error;
  }

  if (slot.status === "Booked") {
    const error = new Error("This slot has already been booked");
    error.statusCode = 409;
    throw error;
  }

  if (slot.status === "Held") {
    if (slot.held_until && new Date(slot.held_until) > new Date()) {
      const error = new Error(
        "This slot is currently being held by another customer"
      );
      error.statusCode = 409;
      throw error;
    }

    // Status is 'Held' but expired
    slot.status = "Available";
    slot.held_until = null;
    await slot.save({ transaction });
  }

  if (slot.status !== "Available") {
    const error = new Error("This slot is not available");
    error.statusCode = 409;
    throw error;
  }

  return { meetingLink, slot };
};

module.exports = {
  validateHoldSlotRequest,
};
