const { AvailabilitySlot, AgentAvailability } = require("../../../models");
const { Op } = require("sequelize");
const { expirePastSlots } = require("./slotExpiration.service");

class SlotService {
  /**
   * Fetch all slots belonging to a specific agent
   */
  async getAgentSlots(agentId, filters = {}) {
    // Run on-demand expiration for past unbooked slots
    await expirePastSlots().catch((err) => console.error("Error in on-demand expirePastSlots:", err));

    // Build the query options
    const options = {
      include: [
        {
          model: AgentAvailability,
          as: "availability",
          where: { agent_id: agentId },
          attributes: [], // We don't necessarily need to return the availability data itself, just use it for filtering
        },
      ],
      order: [["start_datetime", "ASC"]],
    };

    if (filters.date) {
      // Filter by specific date
      options.include[0].where.availability_date = filters.date;
    } else if (filters.startDate && filters.endDate) {
      // Filter by date range
      options.include[0].where.availability_date = {
        [Op.gte]: filters.startDate,
        [Op.lte]: filters.endDate,
      };
    }

    return await AvailabilitySlot.findAll(options);
  }
}

module.exports = new SlotService();
