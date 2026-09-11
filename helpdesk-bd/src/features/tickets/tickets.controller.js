const { Ticket, User, TicketComment } = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/pagination");

// Generate a random ticket number, e.g., TKT-12345678
const generateTicketNumber = () => {
  return `TKT-${Math.floor(10000000 + Math.random() * 90000000)}`;
};

const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body;
    
    // Customer ID comes from the authenticated user
    const customer_id = req.user.id; 

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Subject, description, and category are required.",
      });
    }

    // Check if category is valid based on migration ENUM
    const validCategories = ["Technical", "Billing", "Account", "General"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }
    
    // Check if priority is valid based on migration ENUM
    const validPriorities = ["Low", "Medium", "High"];
    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Invalid priority.",
          });
    }

    const ticket_number = generateTicketNumber();

    const newTicket = await Ticket.create({
      ticket_number,
      customer_id,
      subject,
      description,
      category,
      priority: priority || "Medium",
      status: "Open" // Default from migration
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      data: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket.",
    });
  }
};

const getCustomerTickets = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { search, status, page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {
      customer_id,
    };

    // Handle status filter
    if (status && status !== "All") {
      whereClause.status = status;
    }

    // Handle search by ticket number or subject
    if (search) {
      whereClause[Op.or] = [
        {
          ticket_number: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          subject: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    const tickets = await Ticket.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = getPagingData(tickets, page, limit, 'tickets');

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets.",
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user.id;

    const ticket = await Ticket.findOne({
      where: {
        id,
        customer_id,
      },
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
        {
          model: TicketComment,
          as: "comments",
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["first_name", "last_name", "role"],
            }
          ]
        },
      ],
      order: [
        [{ model: TicketComment, as: 'comments' }, 'created_at', 'ASC']
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ticket details.",
    });
  }
};

module.exports = {
  createTicket,
  getCustomerTickets,
  getTicketById,
};
