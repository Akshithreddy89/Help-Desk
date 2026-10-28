const { Ticket, User, TicketComment, sequelize } = require("../../../../models");
const { Op } = require("sequelize");
const { FAQ_TOPICS, findFaqMatch } = require("../faq.knowledge");
const aiService = require("../services/ai.service");

// Helper to generate unique ticket numbers (e.g. TKT-12345678)
const generateTicketNumber = () => {
  return `TKT-${Math.floor(10000000 + Math.random() * 90000000)}`;
};
/**
 * 1. Get Customer's 5 Latest Ticket Names (Subjects)
 */
const getMyRecentTicketNames = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const tickets = await Ticket.findAll({
      where: { customer_id },
      order: [["created_at", "DESC"]],
      limit: 5,
      attributes: ["id", "ticket_number", "subject", "status", "category", "priority", "created_at"],
    });
    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching recent ticket names:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent tickets.",
    });
  }
};
/**
 * 2. Lookup Ticket Status by Ticket Name (Subject)
 */
const getTicketStatusByName = async (req, res) => {
  try {
    const { name } = req.query;
    const customer_id = req.user.id;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ticket name is required.",
      });
    }
    const tickets = await Ticket.findAll({
      where: {
        customer_id,
        subject: {
          [Op.iLike]: `%${name.trim()}%`, // Case-insensitive matching in PostgreSQL
        },
      },
      attributes: ["id", "ticket_number", "subject", "status", "category", "priority", "created_at", "updated_at"],
      include: [
        {
          model: User,
          as: "assignedAgent",
          attributes: ["first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 5,
    });
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No ticket found with name matching "${name}".`,
      });
    }
    const formatted = tickets.map((t) => ({
      id: t.id,
      ticket_number: t.ticket_number,
      subject: t.subject,
      status: t.status,
      category: t.category,
      priority: t.priority,
      assignedAgent: t.assignedAgent
        ? `${t.assignedAgent.first_name} ${t.assignedAgent.last_name}`
        : "Pending assignment",
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));
    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted.length === 1 ? formatted[0] : formatted,
    });
  } catch (error) {
    console.error("Error looking up ticket by name:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to look up ticket status.",
    });
  }
};

/**
 * 3. FAQ Query Handler (verified FAQ match with Gemini fallback)
 */
const chatFaq = async (req, res) => {
  try {
    const { query, topicId } = req.body;
    // Fast-path: Explicit topic requested
    if (topicId) {
      const topic = FAQ_TOPICS.find((t) => t.id === topicId);
      if (topic) {
        return res.status(200).json({
          success: true,
          data: {
            title: topic.title,
            answer: topic.solution,
            suggestedAction: "check_resolution",
          },
        });
      }
    }
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query is required.",
      });
    }

    const matchedTopic = findFaqMatch(query);
    if (matchedTopic) {
      return res.status(200).json({
        success: true,
        data: {
          title: matchedTopic.title,
          answer: matchedTopic.solution,
          suggestedAction: "check_resolution",
        },
      });
    }

    const allKnowledge = FAQ_TOPICS.map((t) => `Topic: ${t.title}\n${t.solution}`).join("\n\n");
    const aiAnswer = await aiService.answerFaqConversation(query.trim(), allKnowledge);
    return res.status(200).json({
      success: true,
      data: {
        title: "Support Advice",
        answer: aiAnswer,
        suggestedAction: "check_resolution",
      },
    });
  } catch (error) {
    console.error("Error processing FAQ chat:", error);
    const isGeminiUnavailable = error.statusCode === 503;
    return res.status(isGeminiUnavailable ? 503 : 500).json({
      success: false,
      message: isGeminiUnavailable
        ? "The AI assistant is temporarily unavailable. Please try again shortly."
        : "Failed to answer FAQ query.",
    });
  }
};


/**
 * 4. Classify Raw Issue & Generate Ticket Draft
 */
const classifyIssue = async (req, res) => {
  try {
    const { rawDescription } = req.body;
    if (!rawDescription || !rawDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Issue description is required.",
      });
    }
    const draft = await aiService.classifyIssue(rawDescription);
    return res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error("Error classifying ticket issue:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to classify ticket draft.",
    });
  }
};
/**
 * 5. Confirm Draft & Create Ticket (Atomic Transaction)
 */
const confirmTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { subject, description, category, priority, original_description } = req.body;
    const customer_id = req.user.id;
    if (!subject || !description || !category) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Subject, description, and category are required.",
      });
    }
    const validCategories = ["Technical", "Billing", "Account", "General"];
    if (!validCategories.includes(category)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Invalid category." });
    }
    const validPriorities = ["Low", "Medium", "High"];
    if (priority && !validPriorities.includes(priority)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Invalid priority." });
    }
    const ticket_number = generateTicketNumber();
    // Step 1: Create Ticket
    const newTicket = await Ticket.create(
      {
        ticket_number,
        customer_id,
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority: priority || "Medium",
        status: "Open",
      },
      { transaction }
    );
    // Step 2: Preserve Original Customer Input as First Comment
    if (original_description && original_description.trim()) {
      await TicketComment.create(
        {
          ticket_id: newTicket.id,
          sender_id: customer_id,
          message: `[AI Assistant - Original Customer Issue]:\n${original_description.trim()}`,
        },
        { transaction }
      );
    }
    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      data: {
        id: newTicket.id,
        ticket_number: newTicket.ticket_number,
        subject: newTicket.subject,
        status: newTicket.status,
        category: newTicket.category,
        priority: newTicket.priority,
        created_at: newTicket.created_at,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error confirming and creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket.",
    });
  }
};



module.exports = {
  getMyRecentTicketNames,
  getTicketStatusByName,
  chatFaq,
  classifyIssue,
  confirmTicket,
}