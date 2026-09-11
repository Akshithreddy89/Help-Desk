const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./features/auth/auth.routes");
const userRoutes = require("./features/users/customer/user.routes");
const adminRoutes = require("./features/admin/admin.routes");
const ticketRoutes = require("./features/tickets/ticket.routes");
const commentRoutes = require("./features/comments/comment.routes");
const agentRoutes = require("./features/agent/agent.routes");
const agentAvailabilityRoutes = require("./features/agent-scheduling/routes/agentAvailability.routes");
const agentSlotRoutes = require("./features/agent-scheduling/routes/agentSlot.routes");
const meetingLinkRoutes = require("./features/agent-scheduling/routes/meetingLink.routes");
const publicScheduleRoutes = require("./features/agent-scheduling/routes/publicSchedule.routes");
const calendarRoutes = require("./features/agent-scheduling/routes/calendar.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customer", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/agent/availabilities", agentAvailabilityRoutes);
app.use("/api/agent/slots", agentSlotRoutes);
app.use("/api/agent", meetingLinkRoutes);
app.use("/api/public", publicScheduleRoutes);
app.use("/api/agent", calendarRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "HelpDesk Backend Running...",
  });
});

module.exports = app;
