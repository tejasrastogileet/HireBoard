// Stream video client removed. Provide no-op stubs to avoid import/runtime errors.
export const initializeStreamClient = async () => {
  console.log("ℹ️ Stream integration removed: initializeStreamClient is a no-op");
  return null;
};

export const disconnectStreamClient = async () => {
  console.log("ℹ️ Stream integration removed: disconnectStreamClient is a no-op");
};
