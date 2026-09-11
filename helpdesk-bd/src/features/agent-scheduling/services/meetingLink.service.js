const { v4: uuidv4 } = require("uuid");
const { MeetingLink } = require("../../../models");

const createMeetingLink = async (agentId) => {
  // Check whether the agent already has an active meeting link
  const existingLink = await MeetingLink.findOne({
    where: {
      agent_id: agentId,
      status: "Active",
    },
  });

  // If an active link already exists,
  // return the existing link instead of creating another one
  if (existingLink) {
    return existingLink;
  }

  // Generate UUID
  const publicToken = uuidv4();

  // Create meeting link
  const meetingLink = await MeetingLink.create({
    agent_id: agentId,
    public_token: publicToken,
    status: "Active",
  });

  return meetingLink;
};

const getMeetingLink = async (agentId) => {
  const meetingLink = await MeetingLink.findOne({
    where: {
      agent_id: agentId,
      status: "Active",
    },
  });

  return meetingLink;
};

module.exports = {
  createMeetingLink,
  getMeetingLink,
};
