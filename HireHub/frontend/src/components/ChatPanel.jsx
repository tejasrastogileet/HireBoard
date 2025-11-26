import { useEffect, useState, useRef } from "react";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ChatPanel Component - Real-time chat interface for collaborative sessions
 * @param {Object} socket - Socket.IO socket instance from useSocket hook
 * @param {string} currentClerkId - Current user's Clerk ID
 * @param {string} participantName - Participant's display name (optional)
 */
export const ChatPanel = ({ socket, currentClerkId, participantName = "Participant" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      console.log("[ChatPanel] Received message:", msg);
      setMessages((prev) => [...prev, msg]);
      setError(null);
    };

    const handleUserJoined = (data) => {
      console.log("[ChatPanel] User joined:", data.clerkId);
      const systemMsg = {
        id: `system-${data.timestamp}`,
        type: "system",
        text: `${data.clerkId === currentClerkId ? "You" : participantName} joined the session`,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, systemMsg]);
    };

    const handleUserLeft = (data) => {
      console.log("[ChatPanel] User left:", data.clerkId);
      const systemMsg = {
        id: `system-${data.timestamp}`,
        type: "system",
        text: `${data.clerkId === currentClerkId ? "You" : participantName} left the session`,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, systemMsg]);
    };

    const handleTyping = (data) => {
      if (data.clerkId !== currentClerkId) {
        setRemoteTyping(data.isTyping);
      }
    };

    const handleError = (err) => {
      console.error("[ChatPanel] Socket error:", err);
      setError(typeof err === "string" ? err : "Connection error");
      toast.error("Chat connection error: " + (typeof err === "string" ? err : "Unknown error"));
    };

    socket.on("message", handleMessage);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("typing", handleTyping);
    socket.on("error", handleError);

    return () => {
      socket.off("message", handleMessage);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("typing", handleTyping);
      socket.off("error", handleError);
    };
  }, [socket, currentClerkId, participantName]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (!socket) {
      toast.error("Chat not connected");
      return;
    }

    try {
      socket.emit("message", { text: input.trim() });
      setInput("");
      setIsTyping(false);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (err) {
      console.error("[ChatPanel] Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);

    // Send typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket?.emit("typing", { isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("typing", { isTyping: false });
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageAuthor = (clerkId) => {
    return clerkId === currentClerkId ? "You" : participantName;
  };

  const isYourMessage = (clerkId) => clerkId === currentClerkId;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-white font-semibold">Live Chat</h3>
        {!socket ? (
          <span className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle size={14} />
            Disconnected
          </span>
        ) : (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle2 size={14} />
            Connected
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-900/20 border-b border-red-900/50 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No messages yet. Start typing to begin the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div
                  key={msg.id}
                  className="text-center text-xs text-slate-500 py-2 italic"
                >
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={`${msg.clerkId}-${msg.timestamp}`}
                className={`flex ${isYourMessage(msg.clerkId) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    isYourMessage(msg.clerkId)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {getMessageAuthor(msg.clerkId)}
                  </div>
                  <p className="break-words text-sm">{msg.text}</p>
                  <div
                    className={`text-xs mt-1 opacity-50 text-right ${
                      isYourMessage(msg.clerkId) ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {remoteTyping && (
          <div className="flex items-end gap-2">
            <div className="bg-slate-700 px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
            <span className="text-xs text-slate-500">{participantName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={!socket}
          className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm placeholder-slate-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!socket || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
