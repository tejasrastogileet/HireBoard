// Stream hooks removed. Return safe no-op values to avoid runtime errors where hook is still imported.
export default function useStreamClient() {
  return {
    streamClient: null,
    call: null,
    chatClient: null,
    channel: null,
    isInitializingCall: false,
  };
}
