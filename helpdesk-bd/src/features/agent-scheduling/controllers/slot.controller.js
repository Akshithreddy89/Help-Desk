const slotService = require("../services/slot.service");

class SlotController {
  /**
   * GET /api/agent/slots
   * Query params:
   *  - date: YYYY-MM-DD to filter slots by a specific date
   *  - startDate & endDate: YYYY-MM-DD to filter slots by a date range
   */
  async getSlots(req, res) {
    try {
      const agentId = req.user.id; // Assuming auth middleware sets req.user
      const { date, startDate, endDate } = req.query;

      // Strict Validation: Require either date OR both startDate and endDate
      if (!date && !(startDate && endDate)) {
        return res.status(400).json({
          success: false,
          message: "Please provide either 'date' or both 'startDate' and 'endDate' query parameters.",
        });
      }

      const slots = await slotService.getAgentSlots(agentId, { date, startDate, endDate });

      return res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error) {
      console.error("Error fetching slots:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch slots",
      });
    }
  }
}

module.exports = new SlotController();
