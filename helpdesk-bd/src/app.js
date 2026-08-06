const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./features/auth/auth.routes");
const userRoutes = require("./features/users/customer/user.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customer", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "HelpDesk Backend Running...",
  });
});

module.exports = app;
