const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TicketComment = sequelize.define(
  "TicketComment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "ticket_comments",

    timestamps: true,

    createdAt: "created_at",

    updatedAt: "updated_at",
  },
);

module.exports = TicketComment;
