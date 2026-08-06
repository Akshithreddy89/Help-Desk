const sequelize = require("../config/database");
const User = require("./user.model");
const Ticket = require("./ticket.model");
const TicketComment = require("./ticketComment.model");
const PasswordResetToken = require("./passwordResetToken.model");

// ==============================
// Associations
// ==============================

// User <-> Ticket (Customer)
User.hasMany(Ticket, {
  foreignKey: "customer_id",
  as: "createdTickets",
});
Ticket.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer",
});

// User <-> Ticket (Agent)
User.hasMany(Ticket, {
  foreignKey: "assigned_agent_id",
  as: "assignedTickets",
});
Ticket.belongsTo(User, {
  foreignKey: "assigned_agent_id",
  as: "assignedAgent",
});

// Ticket <-> TicketComment
Ticket.hasMany(TicketComment, {
  foreignKey: "ticket_id",
  as: "comments",
});
TicketComment.belongsTo(Ticket, {
  foreignKey: "ticket_id",
  as: "ticket",
});

// User <-> TicketComment
User.hasMany(TicketComment, {
  foreignKey: "sender_id",
  as: "comments",
});
TicketComment.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

// User <-> PasswordResetToken
User.hasMany(PasswordResetToken, {
  foreignKey: "user_id",
  as: "passwordResetTokens",
});
PasswordResetToken.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  sequelize,
  User,
  Ticket,
  TicketComment,
  PasswordResetToken,
};
