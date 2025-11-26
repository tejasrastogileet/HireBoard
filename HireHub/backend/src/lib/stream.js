import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ CRITICAL: STREAM_API_KEY or STREAM_API_SECRET is missing");
  console.error("   Check your .env file in backend/");
  process.exit(1);
}

console.log("✅ Stream SDK initialization starting...");
console.log(`   API Key: ${apiKey.substring(0, 10)}...`);

/* CHAT CLIENT */
let chatClient;
try {
  chatClient = StreamChat.getInstance(apiKey, apiSecret);
  console.log("✅ Chat client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Chat client:", error.message);
  process.exit(1);
}

export { chatClient };

/* UPSERT USER */
export const upsertStreamUser = async (userData) => {
  try {
    if (!userData?.id) {
      console.error("❌ Cannot upsert Stream user: id is missing", userData);
      return;
    }
    
    console.log(`📝 Upserting Stream user: ${userData.id}`);
    await chatClient.upsertUser(userData);
    console.log(`✅ Stream user upserted successfully: ${userData.id} (${userData.name})`);
  } catch (error) {
    console.error(`❌ Error upserting Stream user ${userData?.id}:`, error.message);
    throw error; // Re-throw so caller knows about it
  }
};

/* DELETE USER */
export const deleteStreamUser = async (userId) => {
  try {
    if (!userId) {
      console.error("❌ Cannot delete Stream user: userId is missing");
      return;
    }
    
    console.log(`🗑️ Deleting Stream user: ${userId}`);
    await chatClient.deleteUser(userId);
    console.log(`✅ Stream user deleted successfully: ${userId}`);
  } catch (error) {
    console.error(`❌ Error deleting Stream user ${userId}:`, error.message);
    throw error; // Re-throw so caller knows about it
  }
};
