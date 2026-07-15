const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

const JWT_SECRET = process.env.JWT_SECRET || "chat-app-secret-key-change-in-production";
const onlineUsers = new Map();

function initializeSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id} (${socket.user.username})`);

    socket.on("user:join", (username) => {
      socket.username = username;
      onlineUsers.set(username, socket.id);
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`${username} joined`);
    });

    socket.on("message:send", async (data) => {
      try {
        const message = await Message.create({
          username: data.username,
          text: data.text,
        });
        io.emit("message:new", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("message:error", "Failed to send message");
      }
    });

    socket.on("typing:start", (username) => {
      socket.broadcast.emit("typing:show", username);
    });

    socket.on("typing:stop", (username) => {
      socket.broadcast.emit("typing:hide", username);
    });

    socket.on("disconnect", () => {
      if (socket.username) {
        onlineUsers.delete(socket.username);
        io.emit("users:online", Array.from(onlineUsers.keys()));
        console.log(`${socket.username} disconnected`);
      }
    });
  });
}

module.exports = { initializeSocket };
