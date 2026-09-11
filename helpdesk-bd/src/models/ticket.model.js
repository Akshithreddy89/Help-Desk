const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    ticket_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    assigned_agent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM("Technical", "Billing", "Account", "General"),
      allowNull: false,
    },

    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium",
    },

    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Closed"),
      defaultValue: "Open",
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Ticket;
