require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const chatRoutes = require("./routes/chat");
const toolRoutes = require("./routes/tools");
const businessRoutes = require("./routes/business");
const healthRoutes = require("./routes/health");
const moneyRoutes = require("./routes/money");
const emailRoutes = require("./routes/email");
const authRoutes = require("./src/routes/auth.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const marketplaceRoutes = require('./routes/marketplace');
const investmentRoutes = require('./routes/investment');
const telemedicineRoutes = require('./routes/telemedicine');
const insuranceRoutes = require('./routes/insurance');
const communityRoutes = require('./routes/community');
const b2bRoutes = require('./routes/b2b');

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes

app.use("/api/chat", chatRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/money", moneyRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/investment", investmentRoutes);
app.use("/api/telemedicine", telemedicineRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/b2b", b2bRoutes);

app.get("/", (req, res) => {
  res.send("AI SuperApp Backend Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
