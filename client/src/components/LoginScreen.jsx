import { useState } from "react";
import "./LoginScreen.css";

const API_URL = import.meta.env.PROD ? "" : "http://localhost:5000";

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    username.trim().length >= 2 && password.length >= 6 && !loading;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1>Chat App</h1>
        <p className="login-subtitle">
          {mode === "login" ? "Sign in to your account" : "Create a new account"}
        </p>

        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            maxLength={20}
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            maxLength={50}
            className="login-input"
          />
          <button type="submit" disabled={!isValid} className="login-button">
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
