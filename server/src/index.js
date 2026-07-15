require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const { initializeSocket } = require("./socket/handler");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  },
});

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use("/api", messageRoutes);

app.use(errorHandler);

initializeSocket(io);

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
