// In-memory store for Socket.IO room access control
// Maps room IDs (session.callId) to Sets of allowed Clerk IDs

const allowed = new Map();

export const addAllowed = (room, clerkId) => {
  if (!allowed.has(room)) {
    allowed.set(room, new Set());
  }
  allowed.get(room).add(clerkId);
  console.log(`[SocketStore] Added ${clerkId} to room ${room}. Total allowed: ${allowed.get(room).size}`);
};

export const removeAllowed = (room, clerkId) => {
  if (allowed.has(room)) {
    allowed.get(room).delete(clerkId);
    console.log(`[SocketStore] Removed ${clerkId} from room ${room}. Remaining: ${allowed.get(room).size}`);
    
    // Clean up empty rooms
    if (allowed.get(room).size === 0) {
      allowed.delete(room);
      console.log(`[SocketStore] Cleaned up empty room ${room}`);
    }
  }
};

export const isAllowed = (room, clerkId) => {
  const result = allowed.has(room) && allowed.get(room).has(clerkId);
  console.log(`[SocketStore] isAllowed check - room: ${room}, clerkId: ${clerkId}, allowed: ${result}`);
  return result;
};

export const clearRoom = (room) => {
  if (allowed.has(room)) {
    const count = allowed.get(room).size;
    allowed.delete(room);
    console.log(`[SocketStore] Cleared room ${room} (had ${count} participants)`);
  }
};

export const getRoomParticipants = (room) => {
  return allowed.has(room) ? Array.from(allowed.get(room)) : [];
};

export const getAllRooms = () => {
  return Array.from(allowed.keys());
};
