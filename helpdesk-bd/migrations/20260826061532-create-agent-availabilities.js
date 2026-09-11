"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("agent_availabilities", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
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

      availability_date: {
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

      slot_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Active", "Inactive", "Not Available"),
        allowNull: false,
        defaultValue: "Active",
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
    });

    await queryInterface.addIndex(
      "agent_availabilities",
      ["agent_id", "availability_date"],
      {
        name: "idx_agent_availabilities_agent_date",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "agent_availabilities",
      "idx_agent_availabilities_agent_date",
    );

    await queryInterface.dropTable("agent_availabilities");

    // PostgreSQL ENUM cleanup
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_agent_availabilities_status";
    `);
  },
};
