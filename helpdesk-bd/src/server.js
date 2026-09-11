require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");
const {
  releaseExpiredHolds,
} = require("./features/agent-scheduling/services/holdSlot.service");
const {
  expirePastSlots,
} = require("./features/agent-scheduling/services/slotExpiration.service");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database Connected Successfully");

    // Periodic cleanup every 30 seconds
    setInterval(() => {
      releaseExpiredHolds().catch((error) => {
        console.error("Release expired holds error:", error);
      });
      expirePastSlots().catch((error) => {
        console.error("Expire past slots error:", error);
      });
    }, 30 * 1000);

    app.listen(PORT, () => {
      console.log(`Server Running On Port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Database Connection Failed");
    console.error(error);
  }
}

startServer();
