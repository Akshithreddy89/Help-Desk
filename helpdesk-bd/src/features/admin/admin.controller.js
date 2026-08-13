const User = require("../../models/user.model");
const { Ticket } = require("../../models");
const { Op } = require("sequelize");
const { sendTestEmail } = require("../../services/email.service");
const { v4: uuidv4 } = require("uuid");
const PasswordResetToken = require("../../models/passwordResetToken.model");

const { sendAgentInvitation } = require("../../services/email.service");

// =========================
// Create Agent
// =========================

const createAgent = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number } = req.body;

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

// =========================
// Get All Agents
// =========================

const getAllAgents = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = {
      role: "AGENT",
    };

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const agents = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Ticket,
          as: "assignedTickets",
          attributes: ["id", "status"],
        },
      ],
    });

    const formattedAgents = agents.map(agent => {
      const agentJson = agent.toJSON();
      const tickets = agentJson.assignedTickets || [];
      
      const total_tickets = tickets.length;
      const open_tickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length;
      const resolved_closed_tickets = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;
      
      delete agentJson.assignedTickets;
      
      return {
        ...agentJson,
        total_tickets,
        open_tickets,
        resolved_closed_tickets
      };
    });

    return res.status(200).json({
      success: true,
      message: "Agents fetched successfully.",
      data: formattedAgents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch agents.",
    });
  }
};

// =========================
// Get All Tickets (Admin)
// =========================

const getAllTickets = async (req, res) => {
  try {
    const { search, status, priority, agentId } = req.query;

    const whereClause = {};

    // Filter by status
    if (status && status !== "All") {
      whereClause.status = status;
    }

    // Filter by priority
    if (priority && priority !== "All") {
      whereClause.priority = priority;
    }

    // Filter by assigned agent
    if (agentId && agentId !== "All") {
      if (agentId === "Unassigned") {
        whereClause.assigned_agent_id = null;
      } else {
        whereClause.assigned_agent_id = agentId;
      }
    }

    // Search by subject or ticket_number
    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { ticket_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["first_name", "last_name", "email"],
        },
        {
          model: User,
          as: "assignedAgent",
          attributes: ["first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully.",
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets.",
    });
  }
};

// =========================
// Assign Ticket to Agent
// =========================

const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;       // ticket id
    const { agent_id } = req.body;   // agent to assign

    if (!agent_id) {
      return res.status(400).json({
        success: false,
        message: "agent_id is required.",
      });
    }

    // Make sure the ticket exists
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    // Make sure the agent exists and is actually an AGENT
    const agent = await User.findOne({
      where: { id: agent_id, role: "AGENT" },
      attributes: ["id", "first_name", "last_name", "email"],
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    // Assign the agent and update ticket status to In Progress if it was Open
    const updatedStatus = ticket.status === "Open" ? "In Progress" : ticket.status;

    await ticket.update({
      assigned_agent_id: agent_id,
      status: updatedStatus,
    });

    return res.status(200).json({
      success: true,
      message: `Ticket assigned to ${agent.first_name} ${agent.last_name} successfully.`,
      data: {
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        status: updatedStatus,
        assignedAgent: agent,
      },
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign ticket.",
    });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAllTickets,
  assignTicket,
};
