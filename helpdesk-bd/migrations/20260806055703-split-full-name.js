"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "full_name", "first_name");

    await queryInterface.addColumn("users", "last_name", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "last_name");

    await queryInterface.renameColumn("users", "first_name", "full_name");
  },
};
