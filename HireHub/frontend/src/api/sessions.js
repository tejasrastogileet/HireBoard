import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data, config) => {
    const response = await axiosInstance.post("/sessions", data, config);
    return response.data;
  },

  getActiveSessions: async (config) => {
    const response = await axiosInstance.get("/sessions/active", config);
    return response.data;
  },

  getMyRecentSessions: async (config) => {
    const response = await axiosInstance.get("/sessions/my-recent", config);
    return response.data;
  },

  getSessionById: async (id, config) => {
    const response = await axiosInstance.get(`/sessions/${id}`, config);
    return response.data;
  },

  joinSession: async (id, config) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`, {}, config);
    return response.data;
  },

  leaveSession: async (id, config) => {
    const response = await axiosInstance.post(`/sessions/${id}/leave`, {}, config);
    return response.data;
  },

  endAllSessions: async (config) => {
    const response = await axiosInstance.post(`/sessions/end-all`, {}, config);
    return response.data;
  },
  previewEndAll: async (config) => {
    const response = await axiosInstance.get(`/sessions/preview/end-all`, config);
    return response.data;
  },

  endSession: async (id, config) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`, {}, config);
    return response.data;
  },

  getStreamToken: async (config) => {
    const response = await axiosInstance.get(`/chat/token`, config);
    return response.data;
  },
};
