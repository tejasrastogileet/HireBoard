import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (!session?.callId) {
        console.warn("⚠️ useStreamClient: No callId in session");
        setIsInitializingCall(false);
        return;
      }
      
      if (!isHost && !isParticipant) {
        console.warn("⚠️ useStreamClient: User is neither host nor participant");
        setIsInitializingCall(false);
        return;
      }
      
      if (session.status === "completed") {
        console.warn("⚠️ useStreamClient: Session is already completed");
        setIsInitializingCall(false);
        return;
      }

      try {
        console.log("📝 useStreamClient: Fetching Stream token...");
        
        // Get token from backend
        const tokenResponse = await sessionApi.getStreamToken();
        
        if (!tokenResponse) {
          console.error("❌ Token response is empty");
          throw new Error("No token response from server");
        }

        const { token, userId, userName, userImage } = tokenResponse;

        if (!token) {
          console.error("❌ Token is missing from response:", tokenResponse);
          throw new Error("No token in response - user may not be authenticated");
        }

        if (!userId) {
          console.error("❌ UserId is missing from response:", tokenResponse);
          throw new Error("No userId in response");
        }

        console.log(`✅ Token received for user: ${userId} (${userName})`);

        // Initialize Stream Video Client
        console.log("📝 Initializing Stream Video client...");
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (!client) {
          throw new Error("Failed to initialize Stream Video client");
        }

        console.log("✅ Stream Video client initialized");
        setStreamClient(client);

        // Join video call
        console.log(`📝 Joining video call: ${session.callId}...`);
        videoCall = client.call("default", session.callId);
        
        const joinResult = await videoCall.join({ create: true });
        console.log("✅ Joined video call successfully", joinResult);
        setCall(videoCall);

        // Initialize Chat Client
        console.log("📝 Initializing Stream Chat client...");
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        
        if (!apiKey) {
          console.error("❌ VITE_STREAM_API_KEY is not set in frontend .env");
          throw new Error("Stream API key not configured");
        }

        chatClientInstance = StreamChat.getInstance(apiKey);

        if (!chatClientInstance) {
          throw new Error("Failed to get Stream Chat instance");
        }

        console.log(`📝 Connecting chat user: ${userId}...`);
        const connectResult = await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        console.log("✅ Chat client connected", connectResult);
        setChatClient(chatClientInstance);

        // Watch chat channel
        console.log(`📝 Watching chat channel: ${session.callId}...`);
        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);

        console.log("✅ useStreamClient initialization complete");
      } catch (error) {
        console.error("❌ useStreamClient error:", error.message);
        console.error("Error details:", error);
        
        toast.error(`Failed to join video call: ${error.message}`);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    }

    // cleanup - performance reasons
    return () => {
      // iife
      (async () => {
        try {
          if (videoCall) {
            console.log("🧹 Leaving video call...");
            await videoCall.leave();
          }
          if (chatClientInstance) {
            console.log("🧹 Disconnecting chat user...");
            await chatClientInstance.disconnectUser();
          }
          await disconnectStreamClient();
          console.log("✅ Cleanup complete");
        } catch (error) {
          console.error("❌ Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
