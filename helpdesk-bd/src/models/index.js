const sequelize = require("../config/database");
const User = require("./user.model");
const Ticket = require("./ticket.model");
const TicketComment = require("./ticketComment.model");
const PasswordResetToken = require("./passwordResetToken.model");
const AgentAvailability = require("./agentAvailability.model");
const MeetingLink = require("./meetingLink.model");
const AvailabilitySlot = require("./availabilitySlot.model");
const BookingSession = require("./bookingSession.model");
const MeetingBooking = require("./meetingBooking.model");

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

// User <-> Meeting scheduling
User.hasMany(AgentAvailability, {
  foreignKey: "agent_id",
  as: "agentAvailabilities",
});
AgentAvailability.belongsTo(User, {
  foreignKey: "agent_id",
  as: "agent",
});

User.hasMany(MeetingLink, {
  foreignKey: "agent_id",
  as: "meetingLinks",
});
MeetingLink.belongsTo(User, {
  foreignKey: "agent_id",
  as: "agent",
});

User.hasMany(MeetingBooking, {
  foreignKey: "agent_id",
  as: "meetingBookings",
});
MeetingBooking.belongsTo(User, {
  foreignKey: "agent_id",
  as: "agent",
});

// Availability <-> Slots
AgentAvailability.hasMany(AvailabilitySlot, {
  foreignKey: "availability_id",
  as: "slots",
});
AvailabilitySlot.belongsTo(AgentAvailability, {
  foreignKey: "availability_id",
  as: "availability",
});

// Slots <-> Booking sessions and bookings
AvailabilitySlot.hasMany(BookingSession, {
  foreignKey: "slot_id",
  as: "bookingSessions",
});
BookingSession.belongsTo(AvailabilitySlot, {
  foreignKey: "slot_id",
  as: "slot",
});

AvailabilitySlot.hasMany(MeetingBooking, {
  foreignKey: "slot_id",
  as: "meetingBookings",
});
MeetingBooking.belongsTo(AvailabilitySlot, {
  foreignKey: "slot_id",
  as: "slot",
});

module.exports = {
  sequelize,
  User,
  Ticket,
  TicketComment,
  PasswordResetToken,
  AgentAvailability,
  MeetingLink,
  AvailabilitySlot,
  BookingSession,
  MeetingBooking,
};
