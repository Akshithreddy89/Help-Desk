const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PasswordResetToken = sequelize.define(
  "PasswordResetToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },

  {
    tableName: "password_reset_tokens",

    timestamps: true,

    createdAt: "created_at",

    updatedAt: "updated_at",
  },
);

module.exports = PasswordResetToken;
