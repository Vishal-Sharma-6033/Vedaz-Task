import "./OnlineSidebar.css";

export default function OnlineSidebar({ users, currentUser, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`online-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Online ({users.length})</h3>
          <button className="sidebar-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <ul className="user-list">
          {users.map((user) => (
            <li key={user} className="user-item">
              <span className="user-avatar">
                {user.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">
                {user}
                {user === currentUser && " (you)"}
              </span>
              <span className="user-status" />
            </li>
          ))}
          {users.length === 0 && (
            <li className="no-users">No users online</li>
          )}
        </ul>
      </aside>
    </>
  );
}
