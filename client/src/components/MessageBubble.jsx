import "./MessageBubble.css";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-wrapper ${isOwn ? "own" : "other"}`}>
      {!isOwn && <span className="message-author">{message.username}</span>}
      <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
        <p className="message-text">{message.text}</p>
        <span className="message-time">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
