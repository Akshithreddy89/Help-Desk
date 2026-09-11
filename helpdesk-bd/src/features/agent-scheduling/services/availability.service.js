const {
  sequelize,
  User,
  AgentAvailability,
  AvailabilitySlot,
} = require("../../../models");
const { Op } = require("sequelize");
const { expirePastSlots } = require("./slotExpiration.service");
class AvailabilityService {
  /**
   * Create availability and generate slots within a transaction
   */
  async createAvailability(agentId, data) {
    const {
      availability_date,
      availability_dates,
      start_time,
      end_time,
      slot_duration_minutes,
    } = data;

    // Support both single date (string) and array of dates (availability_dates or availability_date as an array)
    const dates = Array.isArray(availability_dates)
      ? availability_dates
      : Array.isArray(availability_date)
        ? availability_date
        : availability_date
          ? [availability_date]
          : [];

    if (dates.length === 0) {
      throw new Error("At least one availability date must be provided.");
    }

    if (!start_time || !end_time || start_time >= end_time) {
      throw new Error("start_time must be before end_time.");
    }

    if (!Number.isInteger(Number(slot_duration_minutes)) || Number(slot_duration_minutes) <= 0) {
      throw new Error("slot_duration_minutes must be a positive integer.");
    }

    // Start a transaction since we are creating availability AND multiple slots
    const transaction = await sequelize.transaction();

    try {
      // Lock the agent row so concurrent requests cannot both pass an empty
      // overlap check before either request inserts its availability.
      await User.findByPk(agentId, {
        attributes: ["id"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const createdAvailabilities = [];

      for (const date of dates) {
        const overlappingAvailability = await AgentAvailability.findOne({
          where: {
            agent_id: agentId,
            availability_date: date,
            status: "Active",
            [Op.and]: [
              { start_time: { [Op.lt]: end_time } },
              { end_time: { [Op.gt]: start_time } },
            ],
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (overlappingAvailability) {
          throw new Error(
            `Availability overlaps with an existing availability on ${date}. ` +
              `Existing time: ${overlappingAvailability.start_time} - ` +
              `${overlappingAvailability.end_time}.`,
          );
        }

        // Create the main AgentAvailability record for this date.
        const availability = await AgentAvailability.create(
          {
            agent_id: agentId,
            availability_date: date,
            start_time,
            end_time,
            slot_duration_minutes,
            status: "Active",
          },
          { transaction },
        );

        // 2. Generate the slots
        const slotsToCreate = this.generateSlots(
          availability.id,
          date,
          start_time,
          end_time,
          slot_duration_minutes,
        );

        // 3. Bulk insert slots
        if (slotsToCreate.length > 0) {
          await AvailabilitySlot.bulkCreate(slotsToCreate, { transaction });
        } else {
          throw new Error(
            `Duration and times result in 0 possible slots for date ${date}.`,
          );
        }

        createdAvailabilities.push(availability);
      }

      // 4. Commit transaction
      await transaction.commit();
      return createdAvailabilities.length === 1
        ? createdAvailabilities[0]
        : createdAvailabilities;
    } catch (error) {
      // Rollback on any failure
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Fetch all availabilities for an agent
   */
  async getAgentAvailabilities(agentId, filters = {}) {
    // Run on-demand expiration for past unbooked slots
    await expirePastSlots().catch((err) => console.error("Error in on-demand expirePastSlots:", err));

    const whereClause = { agent_id: agentId };

    if (filters.startDate && filters.endDate) {
      whereClause.availability_date = {
        [Op.gte]: filters.startDate,
        [Op.lte]: filters.endDate,
      };
    }

    return await AgentAvailability.findAll({
      where: whereClause,
      order: [
        ["availability_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  /**
   * Helper method to generate slot objects
   */
  generateSlots(availabilityId, date, startTime, endTime, durationMinutes) {
    const slots = [];

    // Create Date objects for start and end using the provided date string and time strings
    // Format assumes startTime/endTime are in HH:MM or HH:MM:SS format
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new Error("Invalid date or time format provided.");
    }

    let currentSlotStart = new Date(startDateTime);

    while (currentSlotStart < endDateTime) {
      // Calculate the end time of the current slot
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + durationMinutes * 60000,
      );

      // If the slot end time exceeds the overall end time, stop generating
      if (currentSlotEnd > endDateTime) {
        break;
      }

      slots.push({
        availability_id: availabilityId,
        start_datetime: currentSlotStart,
        end_datetime: currentSlotEnd,
        status: "Available",
      });

      // Move to the next slot start
      currentSlotStart = currentSlotEnd;
    }

    return slots;
  }
}

module.exports = new AvailabilityService();
