"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("availability_slots", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      availability_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "agent_availabilities",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      start_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      end_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Available", "Held", "Booked", "Expired"),
        allowNull: false,
        defaultValue: "Available",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      held_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex(
      "availability_slots",
      ["availability_id", "start_datetime", "end_datetime"],
      {
        unique: true,
        name: "uq_availability_slots_time",
      },
    );

    await queryInterface.addIndex(
      "availability_slots",
      ["availability_id", "status"],
      {
        name: "idx_availability_slots_availability_status",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "availability_slots",
      "uq_availability_slots_time",
    );

    await queryInterface.removeIndex(
      "availability_slots",
      "idx_availability_slots_availability_status",
    );

    await queryInterface.dropTable("availability_slots");

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_availability_slots_status";
    `);
  },
};
