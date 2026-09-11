const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AvailabilitySlot = sequelize.define(
  "AvailabilitySlot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    availability_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    start_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("Available", "Held", "Booked", "Expired"),
      allowNull: false,
      defaultValue: "Available",
    },

    held_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "availability_slots",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = AvailabilitySlot;
