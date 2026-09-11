const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingSession = sequelize.define(
  "BookingSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    slot_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    session_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("Active", "Expired", "Completed"),
      allowNull: false,
      defaultValue: "Active",
    },

    held_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "booking_sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = BookingSession;
