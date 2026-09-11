const availabilityService = require("../services/availability.service");

class AvailabilityController {
  /**
   * POST /api/agent/availabilities
   */
  async createAvailability(req, res) {
    try {
      const agentId = req.user.id; // Assuming auth middleware sets req.user
      const {
        availability_date,
        availability_dates,
        start_time,
        end_time,
        slot_duration_minutes,
      } = req.body;

      const dates = availability_dates || availability_date;

      // Basic validation
      if (
        !dates ||
        (Array.isArray(dates) && dates.length === 0) ||
        !start_time ||
        !end_time ||
        !slot_duration_minutes
      ) {
        return res.status(400).json({
          success: false,
          message:
            "availability_date (or availability_dates array), start_time, end_time, and slot_duration_minutes are required",
        });
      }

      if (start_time >= end_time) {
        return res.status(400).json({
          success: false,
          message: "start_time must be before end_time",
        });
      }

      const availability = await availabilityService.createAvailability(
        agentId,
        {
          availability_date,
          availability_dates,
          start_time,
          end_time,
          slot_duration_minutes,
        },
      );

      return res.status(201).json({
        success: true,
        message: "Availability and slots created successfully",
        data: availability,
      });
    } catch (error) {
      console.error("Error creating availability:", error);
      const statusCode = error.message?.startsWith("Availability overlaps")
        ? 409
        : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to create availability",
      });
    }
  }

  /**
   * GET /api/agent/availabilities
   */
  async getAvailabilities(req, res) {
    try {
      const agentId = req.user.id;
      const { startDate, endDate } = req.query;

      const availabilities = await availabilityService.getAgentAvailabilities(
        agentId,
        { startDate, endDate },
      );

      return res.status(200).json({
        success: true,
        data: availabilities,
      });
    } catch (error) {
      console.error("Error fetching availabilities:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch availabilities",
      });
    }
  }
}

module.exports = new AvailabilityController();
