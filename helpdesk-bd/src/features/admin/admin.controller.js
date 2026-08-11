const User = require("../../models/user.model");
const { sendTestEmail } = require("../../services/email.service");
const { v4: uuidv4 } = require("uuid");
const PasswordResetToken = require("../../models/passwordResetToken.model");

const { sendAgentInvitation } = require("../../services/email.service");

// =========================
// Create Agent
// =========================

const createAgent = async (req, res) => {
  try {
    const {
      first_name,

      last_name,

      email,

      phone_number,
    } = req.body;

    // ----------------------------
    // Required Fields Validation
    // ----------------------------

    if (!first_name || !last_name || !email || !phone_number) {
      return res.status(400).json({
        success: false,

        message: "All fields are required.",
      });
    }

    // ----------------------------
    // Normalize Email
    // ----------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // ----------------------------
    // Duplicate Email Check
    // ----------------------------

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,

        message: "Email already exists.",
      });
    }

    // ----------------------------
    // Create Agent
    // ----------------------------

    const agent = await User.create({
      first_name,

      last_name,

      email: normalizedEmail,

      phone_number,

      password: null,

      role: "AGENT",

      account_status: "PENDING",
    });

    // ----------------------------
    // Generate UUID Token
    // ----------------------------

    const token = uuidv4();

    // ----------------------------
    // Expiry Time
    // ----------------------------

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // ----------------------------
    // Save Token
    // ----------------------------

    await PasswordResetToken.create({
      user_id: agent.id,

      token,

      expires_at: expiresAt,
    });

    // ----------------------------
    // Generate Invitation Link
    // ----------------------------

    const invitationLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    // ----------------------------
    // Send Email
    // ----------------------------

    const emailResponse = await sendAgentInvitation(
      agent.email,

      agent.first_name,

      invitationLink,
    );

    const response = agent.toJSON();

    delete response.password;

    return res.status(201).json({
      success: true,

      message: "Agent created successfully. Invitation email sent.",

      emailId: emailResponse.data?.id || emailResponse.id,

      data: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: "Failed to create agent.",
    });
  }
};

module.exports = {
  createAgent,
};
