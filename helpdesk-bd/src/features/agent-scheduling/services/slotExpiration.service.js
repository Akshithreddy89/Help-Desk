const { Op } = require("sequelize");
const {
  sequelize,
  AvailabilitySlot,
  AgentAvailability,
} = require("../../../models");

/**
 * Automatically expires unbooked slots whose scheduled start time is in the past.
 */
const expirePastSlots = async () => {
  const now = new Date();

  try {
    const [updatedCount] = await AvailabilitySlot.update(
      {
        status: "Expired",
      },
      {
        where: {
          start_datetime: {
            [Op.lt]: now,
          },
          status: "Available",
        },
      },
    );

    return updatedCount;
  } catch (error) {
    console.error("Error expiring past slots:", error);
    throw error;
  }
};

module.exports = {
  expirePastSlots,
};
