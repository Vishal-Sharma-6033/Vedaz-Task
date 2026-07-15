import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import OnlineSidebar from "./OnlineSidebar";
import "./ChatScreen.css";

export default function ChatScreen({ username, onLogout }) {
  const {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    sendMessage,
    emitTyping,
    fetchMessages,
  } = useChat();

  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping();
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-left">
          <h2>Chat Room</h2>
          <span className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>
        <div className="header-right">
          <button
            className="sidebar-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="online-count">{onlineUsers.length}</span>
          </button>
          <button className="logout-button" onClick={onLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="chat-body">
        <div className="messages-panel">
          <div className="messages-list">
            {messages.length === 0 && (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.username === username}
              />
            ))}
            {typingUsers.filter((u) => u !== username).length > 0 && (
              <TypingIndicator
                users={typingUsers.filter((u) => u !== username)}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="message-input"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

        <OnlineSidebar
          users={onlineUsers}
          currentUser={username}
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />
      </div>
    </div>
  );
}
