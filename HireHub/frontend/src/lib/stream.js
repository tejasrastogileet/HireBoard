import { StreamVideoClient } from "@stream-io/video-react-sdk";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

let client = null;

export const initializeStreamClient = async (user, token) => {
  // if client exists with same user instead of creating again return it
  if (client && client?.user?.id === user.id) {
    console.log(`✅ Reusing existing Stream client for user: ${user.id}`);
    return client;
  }

  if (client) {
    console.log("🧹 Disconnecting previous Stream client...");
    await disconnectStreamClient();
  }

  if (!apiKey) {
    console.error("❌ Stream API key is not provided");
    throw new Error("Stream API key is not provided.");
  }

  if (!user?.id) {
    console.error("❌ User ID is missing", user);
    throw new Error("User ID is required to initialize Stream client");
  }

  if (!token) {
    console.error("❌ Token is missing", { user, token });
    throw new Error("Token is required to initialize Stream client");
  }

  try {
    console.log(`📝 Creating Stream Video client for user: ${user.id}...`);
    
    client = new StreamVideoClient({
      apiKey,
      user,
      token,
    });

    console.log(`✅ Stream Video client created successfully for: ${user.id}`);
    return client;
  } catch (error) {
    console.error("❌ Failed to create Stream Video client:", error.message);
    client = null;
    throw error;
  }
};

export const disconnectStreamClient = async () => {
  if (client) {
    try {
      console.log("📝 Disconnecting Stream client...");
      await client.disconnectUser();
      client = null;
      console.log("✅ Stream client disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting Stream client:", error.message);
      client = null;
    }
  }
};
