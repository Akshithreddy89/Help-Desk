"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const password1 = await bcrypt.hash("12345", 10);
    const password2 = await bcrypt.hash("12345", 10);

    await queryInterface.bulkInsert("users", [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        first_name: "Akshith",
        last_name: "Reddy",
        email: "admin1@helpdesk.com",
        password: password1,
        phone_number: "9876543210",
        role: "ADMIN",
        account_status: "ACTIVE",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        first_name: "Rahul",
        last_name: "Reddy",
        email: "admin2@helpdesk.com",
        password: password2,
        phone_number: "9876500000",
        role: "ADMIN",
        account_status: "ACTIVE",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      role: "ADMIN",
    });
  },
};
