import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

/**
 * Hook to manage Socket.IO connection for real-time chat
 * @param {string} roomId - Session callId (room identifier)
 * @param {string} clerkId - User's Clerk ID
 * @returns {Object} Socket object and connection state
 */
export const useSocket = (roomId, clerkId) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't connect if missing required params
    if (!roomId || !clerkId) {
      console.log("[useSocket] Missing roomId or clerkId, skipping connection");
      return;
    }

    console.log(`[useSocket] Connecting to room: ${roomId}, user: ${clerkId}`);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      // Remove /api suffix if present
      const socketUrl = apiUrl.replace(/\/api$/, "");

      socket.current = io(socketUrl, {
        // Query parameters used for quick server-side room check
        query: { room: roomId, clerkId },
        // Try HTTP long-polling first to avoid websocket upgrade issues behind proxies
        transports: ["polling", "websocket"],
        // Ensure cookies (if any) are sent along with the handshake
        withCredentials: true,
        path: "/socket.io",
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.current.on("connect", () => {
        console.log("[useSocket] Connected to Socket.IO server");
        setIsConnected(true);
        setError(null);
      });

      socket.current.on("connected", (data) => {
        console.log("[useSocket] Confirmed connection to room:", data);
      });

      socket.current.on("disconnect", () => {
        console.log("[useSocket] Disconnected from Socket.IO server");
        setIsConnected(false);
      });

      socket.current.on("error", (err) => {
        console.error("[useSocket] Socket error:", err);
        setError(err);
      });

      socket.current.on("connect_error", (err) => {
        console.error("[useSocket] Connection error:", err.message);
        setError(err.message);
      });

      return () => {
        console.log("[useSocket] Cleaning up socket connection");
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    } catch (err) {
      console.error("[useSocket] Failed to initialize socket:", err);
      setError(err.message);
    }
  }, [roomId, clerkId]);

  const sendMessage = (text) => {
    if (!socket.current || !isConnected) {
      console.warn("[useSocket] Socket not connected, message not sent");
      return false;
    }

    try {
      socket.current.emit("message", { text });
      return true;
    } catch (err) {
      console.error("[useSocket] Failed to send message:", err);
      return false;
    }
  };

  const sendCodeChange = (code, language = "javascript") => {
    if (!socket.current || !isConnected) return false;

    try {
      socket.current.emit("code_change", { code, language });
      return true;
    } catch (err) {
      console.error("[useSocket] Failed to send code change:", err);
      return false;
    }
  };

  const sendTypingIndicator = (isTyping) => {
    if (!socket.current || !isConnected) return false;

    try {
      socket.current.emit("typing", { isTyping });
      return true;
    } catch (err) {
      console.error("[useSocket] Failed to send typing indicator:", err);
      return false;
    }
  };

  return {
    socket: socket.current,
    isConnected,
    error,
    sendMessage,
    sendCodeChange,
    sendTypingIndicator,
  };
};
