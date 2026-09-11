const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AgentAvailability = sequelize.define(
  "AgentAvailability",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    agent_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    availability_date: {
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

    slot_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Not Available"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    tableName: "agent_availabilities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = AgentAvailability;
