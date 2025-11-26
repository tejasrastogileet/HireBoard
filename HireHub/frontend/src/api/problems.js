import axiosInstance from "../lib/axios";

export const problemApi = {
  createProblem: async (data, config) => {
    const res = await axiosInstance.post("/problems", data, config);
    return res.data;
  },
  getProblems: async (config) => {
    const res = await axiosInstance.get("/problems", config);
    return res.data;
  },
  getProblemById: async (id, config) => {
    const res = await axiosInstance.get(`/problems/${id}`, config);
    return res.data;
  },
  updateProblem: async (id, data, config) => {
    const res = await axiosInstance.put(`/problems/${id}`, data, config);
    return res.data;
  },
  deleteProblem: async (id, config) => {
    const res = await axiosInstance.delete(`/problems/${id}`, config);
    return res.data;
  },
};
