import axiosInstance from "../lib/axios";

export const adminApi = {
  getUsers: async (config) => {
    const res = await axiosInstance.get(`/admin/users`, config);
    return res.data;
  },
  updateUserAdmin: async (id, data, config) => {
    const res = await axiosInstance.put(`/admin/users/${id}`, data, config);
    return res.data;
  },
};
