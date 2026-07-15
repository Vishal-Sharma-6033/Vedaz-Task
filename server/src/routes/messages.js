const express = require("express");
const Message = require("../models/Message");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/messages", async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const query = {};
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { text } = req.body;
    const username = req.user.username;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const message = await Message.create({ username, text });
    res.status(201).json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
