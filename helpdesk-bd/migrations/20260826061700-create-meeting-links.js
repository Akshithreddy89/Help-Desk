"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meeting_links", {
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

      public_token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
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

    await queryInterface.addIndex("meeting_links", ["agent_id"], {
      name: "idx_meeting_links_agent_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "meeting_links",
      "idx_meeting_links_agent_id",
    );

    await queryInterface.dropTable("meeting_links");

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_meeting_links_status";
    `);
  },
};
