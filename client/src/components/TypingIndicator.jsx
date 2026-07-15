import "./TypingIndicator.css";

export default function TypingIndicator({ users }) {
  const text =
    users.length === 1
      ? `${users[0]} is typing`
      : `${users.join(" and ")} are typing`;

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span className="typing-text">{text}</span>
    </div>
  );
}
