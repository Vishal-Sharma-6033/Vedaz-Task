import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? window.location.origin : "http://localhost:5000");

export function useSocket(username, token) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!username || !token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("user:join", username);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("message:new", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message:error", (error) => {
      console.error("Message error:", error);
    });

    socket.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing:show", (user) => {
      setTypingUsers((prev) =>
        prev.includes(user) ? prev : [...prev, user]
      );
    });

    socket.on("typing:hide", (user) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [username, token]);

  const sendMessage = useCallback(
    (text) => {
      if (!socketRef.current || !text.trim()) return;
      socketRef.current.emit("message:send", {
        username,
        text: text.trim(),
      });
    },
    [username]
  );

  const emitTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing:start", username);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", username);
    }, 2000);
  }, [username]);

  const fetchMessages = useCallback(async () => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? "" : "http://localhost:5000");
      const res = await fetch(`${baseUrl}/api/messages?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [token]);

  return {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    sendMessage,
    emitTyping,
    fetchMessages,
    setMessages,
  };
}
