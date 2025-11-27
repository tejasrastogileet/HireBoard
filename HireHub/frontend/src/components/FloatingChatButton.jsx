import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";

export function FloatingChatButton({ socket, currentClerkId, participantName = "Participant" }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button - Fixed Bottom Right */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
        title={isChatOpen ? "Close chat" : "Open chat"}
        aria-label="Toggle chat"
      >
        {isChatOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Popup Panel - Slide In from Bottom Right */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 h-96 rounded-lg shadow-2xl transition-all duration-300 transform ${
          isChatOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <ChatPanel
          socket={socket}
          currentClerkId={currentClerkId}
          participantName={participantName}
        />
      </div>

      {/* Backdrop (optional - for mobile/tablet) */}
      {isChatOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
