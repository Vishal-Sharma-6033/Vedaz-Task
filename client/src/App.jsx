import { useState, useEffect } from "react";
import { ChatProvider } from "./context/ChatContext";
import LoginScreen from "./components/LoginScreen";
import ChatScreen from "./components/ChatScreen";

function loadAuth() {
  try {
    const raw = localStorage.getItem("chat_auth");
    if (raw) {
      const { token, user } = JSON.parse(raw);
      if (token && user) return { token, user };
    }
  } catch {}
  return null;
}

export default function App() {
  const [auth, setAuth] = useState(loadAuth);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("chat_auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("chat_auth");
    }
  }, [auth]);

  const handleLogin = (token, user) => {
    setAuth({ token, user });
  };

  const handleLogout = () => {
    setAuth(null);
  };

  return (
    <ChatProvider username={auth?.user?.username} token={auth?.token}>
      {auth ? (
        <ChatScreen username={auth.user.username} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </ChatProvider>
  );
}
