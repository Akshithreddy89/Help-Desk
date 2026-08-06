require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server Running On Port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Database Connection Failed");
    console.error(error);
  }
}

startServer();
