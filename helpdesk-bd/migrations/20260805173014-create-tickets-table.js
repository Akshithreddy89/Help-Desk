"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tickets", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      ticket_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },

      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      assigned_agent_id: {
        type: Sequelize.UUID,
        allowNull: true,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      category: {
        type: Sequelize.ENUM("Technical", "Billing", "Account", "General"),
        allowNull: false,
      },

      priority: {
        type: Sequelize.ENUM("Low", "Medium", "High"),
        defaultValue: "Medium",
      },

      status: {
        type: Sequelize.ENUM("Open", "In Progress", "Resolved", "Closed"),
        defaultValue: "Open",
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tickets");
  },
};
