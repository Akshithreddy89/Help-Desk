"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meeting_bookings", {
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

      agent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      customer_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      customer_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      customer_phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      meeting_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      booking_reference: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
    });

    await queryInterface.addIndex(
      "meeting_bookings",
      ["agent_id", "meeting_date"],
      {
        name: "idx_meeting_bookings_agent_date",
      },
    );

    await queryInterface.addIndex("meeting_bookings", ["slot_id"], {
      name: "idx_meeting_bookings_slot_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "meeting_bookings",
      "idx_meeting_bookings_agent_date",
    );

    await queryInterface.removeIndex(
      "meeting_bookings",
      "idx_meeting_bookings_slot_id",
    );

    await queryInterface.dropTable("meeting_bookings");
  },
};
