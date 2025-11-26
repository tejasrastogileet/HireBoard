import axiosInstance from "../lib/axios";

// Keep function names compatible with AdminPage expectations
export const adminApi = {
  // legacy name used in AdminPage
  listUsers: async (config) => {
    const res = await axiosInstance.get(`/admin/users`, config);
    return res.data;
  },
  // newer alias
  getUsers: async (config) => {
    return await adminApi.listUsers(config);
  },

  updateUserAdmin: async (id, data, config) => {
    const res = await axiosInstance.put(`/admin/users/${id}`, data, config);
    return res.data;
  },
};
