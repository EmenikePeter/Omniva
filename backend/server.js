require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const chatRoutes = require("./routes/chat");
const toolRoutes = require("./routes/tools");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/tools", toolRoutes);

app.get("/", (req, res) => {
  res.send("AI SuperApp Backend Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
