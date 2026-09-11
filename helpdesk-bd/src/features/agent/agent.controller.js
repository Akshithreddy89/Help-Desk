const { Ticket, User, TicketComment } = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/pagination");

// Get tickets assigned to the authenticated agent
const getAgentTickets = async (req, res) => {
  try {
    // Role guard (route also protects via authorizeRoles)
    if (!req.user || req.user.role !== "AGENT") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const agent_id = req.user.id;
    const { search, status, priority, page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {
      assigned_agent_id: agent_id,
    };

    if (status && status !== "All") {
      whereClause.status = status;
    }

    // Priority filter (e.g., Low, Medium, High)
    if (priority && priority !== "All") {
      whereClause.priority = priority;
    }

    if (search) {
      whereClause[Op.or] = [
        { ticket_number: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
      ];
    }

    const tickets = await Ticket.findAndCountAll({
      where: whereClause,
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: TicketComment,
          as: "comments",
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "first_name", "last_name", "role"],
            },
          ],
        },
      ],
      order: [
        ["created_at", "DESC"],
        [{ model: TicketComment, as: "comments" }, "created_at", "ASC"],
      ],
    });

    const response = getPagingData(tickets, page, limit, "tickets");

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching agent tickets:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets." });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "AGENT") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const { id } = req.params;
    const { status } = req.body;
    const agent_id = req.user.id;

    if (
      !status ||
      !["Open", "In Progress", "Resolved", "Closed"].includes(status)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status provided." });
    }

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    if (ticket.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Closed tickets cannot be updated",
      });
    }

    if (ticket.assigned_agent_id !== agent_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this ticket.",
      });
    }

    await ticket.update({ status });

    return res
      .status(200)
      .json({ success: true, message: "Ticket status updated.", data: ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update ticket status." });
  }
};

const getAgentTicketById = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "AGENT") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const { id } = req.params;
    const agent_id = req.user.id;

    const ticket = await Ticket.findOne({
      where: {
        id,
        assigned_agent_id: agent_id,
      },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: User,
          as: "assignedAgent",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: TicketComment,
          as: "comments",
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "first_name", "last_name", "role"],
            },
          ],
        },
      ],
      order: [[{ model: TicketComment, as: "comments" }, "created_at", "ASC"]],
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch ticket details." });
  }
};

module.exports = {
  getAgentTickets,
  getAgentTicketById,
  updateTicketStatus,
};
