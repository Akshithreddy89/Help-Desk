const { MeetingLink, User } = require("../../../models");

const validatePublicScheduleRequest = async (publicToken) => {
  const meetingLink = await MeetingLink.findOne({
    where: {
      public_token: publicToken,
      status: "Active",
    },
  });

  if (!meetingLink) {
    const error = new Error("Invalid or inactive meeting link");
    error.statusCode = 404;
    throw error;
  }

  const agentId = meetingLink.agent_id;

  const agent = await User.findOne({
    where: {
      id: agentId,
    },
    attributes: ["id", "first_name", "last_name", "email", "phone_number"],
  });

  if (!agent) {
    const error = new Error("Agent not found");
    error.statusCode = 404;
    throw error;
  }

  return { meetingLink, agent };
};

module.exports = {
  validatePublicScheduleRequest,
};
