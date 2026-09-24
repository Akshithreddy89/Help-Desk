"use strict";

module.exports = {
  async up(queryInterface) {
    const tableDefinition = await queryInterface.describeTable("meeting_bookings");
    if (tableDefinition && tableDefinition.event_name) {
      await queryInterface.removeColumn("meeting_bookings", "event_name");
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable("meeting_bookings");
    if (tableDefinition && !tableDefinition.event_name) {
      await queryInterface.addColumn("meeting_bookings", "event_name", {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "Meeting",
      });
    }
  },
};
