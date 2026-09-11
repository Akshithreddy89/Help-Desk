"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("meeting_bookings", "event_name");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("meeting_bookings", "event_name", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "Meeting",
    });
  },
};
