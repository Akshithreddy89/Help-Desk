const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MeetingBooking = sequelize.define(
  "MeetingBooking",
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

    agent_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    customer_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    customer_phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    meeting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    booking_reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "meeting_bookings",
    timestamps: false,
  },
);

module.exports = MeetingBooking;
