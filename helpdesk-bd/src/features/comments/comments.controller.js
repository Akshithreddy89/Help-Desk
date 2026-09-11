const { TicketComment, Ticket } = require("../../models");

const addComment = async (req, res) => {
  try {
    const { ticket_id, message } = req.body;
    const sender_id = req.user.id;

    if (!ticket_id || !message) {
      return res.status(400).json({
        success: false,
        message: "ticket_id and message are required.",
      });
    }

    // Verify the ticket exists
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    // Basic authorization: Only the customer or assigned agent (or an ADMIN) should comment
    // For now, allow if the user is the customer, assigned agent, or has role ADMIN or AGENT
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "AGENT" &&
      ticket.customer_id !== sender_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to comment on this ticket.",
      });
    }

    const comment = await TicketComment.create({
      ticket_id,
      sender_id,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: comment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment.",
    });
  }
};

module.exports = {
  addComment,
};
