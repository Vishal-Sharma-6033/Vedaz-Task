import { createContext, useContext } from "react";
import { useSocket } from "../hooks/useSocket";

const ChatContext = createContext(null);

export function ChatProvider({ children, username, token }) {
  const socketState = useSocket(username, token);

  return (
    <ChatContext.Provider value={socketState}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
