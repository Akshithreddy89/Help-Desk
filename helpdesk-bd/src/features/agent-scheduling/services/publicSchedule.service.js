const { Op } = require("sequelize");
const {
  AgentAvailability,
  AvailabilitySlot,
} = require("../../../models");
const { validatePublicScheduleRequest } = require("../validators/publicSchedule.validator");
const { expirePastSlots } = require("./slotExpiration.service");

const getPublicSchedule = async (publicToken, selectedDate) => {
  // Expire past slots before fetching public schedule
  await expirePastSlots().catch((err) => console.error("Error in public expirePastSlots:", err));

  const { agent } = await validatePublicScheduleRequest(publicToken);
  const agentId = agent.id;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // 3. Get available dates (only today and future dates)
  const availabilities = await AgentAvailability.findAll({
    where: {
      agent_id: agentId,
      status: "Active",
      availability_date: {
        [Op.gte]: todayStr,
      },
    },
    attributes: ["id", "availability_date"],
    order: [["availability_date", "ASC"]],
  });

  const dates = [
    ...new Set(
      availabilities.map((availability) => availability.availability_date),
    ),
  ];

  // 4. If no date selected or selected date is in the past,
  // return agent + available dates
  if (!selectedDate || selectedDate < todayStr) {
    return {
      agent: {
        id: agent.id,
        full_name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email,
        phone_number: agent.phone_number,
      },
      dates,
      slots: [],
    };
  }

  // 5. Check whether selected date is available
  const selectedAvailabilities = await AgentAvailability.findAll({
    where: {
      agent_id: agentId,
      availability_date: selectedDate,
      status: "Active",
    },
  });

  if (!selectedAvailabilities || selectedAvailabilities.length === 0) {
    return {
      agent: {
        id: agent.id,
        full_name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email,
        phone_number: agent.phone_number,
      },
      dates,
      date: selectedDate,
      slots: [],
    };
  }

  // 6. Get ONLY available slots in the future for selected date
  const availabilityIds = selectedAvailabilities.map(a => a.id);
  const slots = await AvailabilitySlot.findAll({
    where: {
      availability_id: {
        [Op.in]: availabilityIds
      },
      status: "Available",
      start_datetime: {
        [Op.gt]: now,
      },
    },
    attributes: ["id", "start_datetime", "end_datetime", "status"],
    order: [["start_datetime", "ASC"]],
  });

  return {
    agent: {
      id: agent.id,
      full_name: `${agent.first_name} ${agent.last_name}`,
      email: agent.email,
      phone_number: agent.phone_number,
    },
    dates,
    date: selectedDate,
    slots,
  };
};

module.exports = {
  getPublicSchedule,
};
