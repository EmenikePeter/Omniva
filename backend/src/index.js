require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./utils/db");
const chatRoutes = require("./routes/chat.routes");
const toolsRoutes = require("./routes/tools.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Connect DB
connectDB();

// API routes
app.use("/api/chat", chatRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => res.json({ status: "ok", service: "omniva-backend" }));

app.listen(PORT, () => {
  console.log(`Omniva backend listening on port ${PORT}`);
});
