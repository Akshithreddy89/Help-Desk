const meetingLinkService = require("../services/meetingLink.service");

const createMeetingLink = async (req, res) => {
  try {
    const agentId = req.user.id;

    const meetingLink = await meetingLinkService.createMeetingLink(agentId);

    const publicUrl = `${process.env.FRONTEND_URL}/schedule/${meetingLink.public_token}`;

    return res.status(201).json({
      success: true,
      message: "Meeting link created successfully",
      meetingLink: {
        id: meetingLink.id,
        public_token: meetingLink.public_token,
        status: meetingLink.status,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error("Create meeting link error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create meeting link",
    });
  }
};

const getMeetingLink = async (req, res) => {
  try {
    const agentId = req.user.id;

    const meetingLink = await meetingLinkService.getMeetingLink(agentId);

    if (!meetingLink) {
      return res.status(404).json({
        success: false,
        message: "Meeting link not found",
      });
    }

    const publicUrl = `${process.env.FRONTEND_URL}/schedule/${meetingLink.public_token}`;

    return res.status(200).json({
      success: true,
      message: "Meeting link fetched successfully",
      meetingLink: {
        id: meetingLink.id,
        public_token: meetingLink.public_token,
        status: meetingLink.status,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error("Get meeting link error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch meeting link",
    });
  }
};

module.exports = {
  createMeetingLink,
  getMeetingLink,
};
