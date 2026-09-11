"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("booking_sessions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      slot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "availability_slots",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      session_token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      status: {
        type: Sequelize.ENUM("Active", "Expired", "Completed"),
        allowNull: false,
        defaultValue: "Active",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      held_until: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("booking_sessions", ["slot_id", "status"], {
      name: "idx_booking_sessions_slot_status",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "booking_sessions",
      "idx_booking_sessions_slot_status",
    );

    await queryInterface.dropTable("booking_sessions");

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_booking_sessions_status";
    `);
  },
};
