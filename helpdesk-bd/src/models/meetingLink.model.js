const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MeetingLink = sequelize.define(
  "MeetingLink",
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

    public_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    tableName: "meeting_links",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = MeetingLink;
