import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";
import { useAuth } from "@clerk/clerk-react";

export const useCreateSession = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationKey: ["createSession"],
    mutationFn: async (data) => {
      const token = await getToken();
      return sessionApi.createSession(data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    },
    onSuccess: () => toast.success("Session created successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to create room"),
  });
};

export const useActiveSessions = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const token = await getToken();
      return sessionApi.getActiveSessions({
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    },
  });
};

export const useMyRecentSessions = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: async () => {
      const token = await getToken();
      return sessionApi.getMyRecentSessions({
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    },
  });
};

export const useSessionById = (id) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["session", id],
    enabled: !!id,
    queryFn: async () => {
      const token = await getToken();
      return sessionApi.getSessionById(id, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    },
    refetchInterval: 5000,
  });
};

export const useJoinSession = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationKey: ["joinSession"],
    mutationFn: async (id) => {
      const token = await getToken();
      return sessionApi.joinSession(id, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    },
    onSuccess: () => toast.success("Joined session successfully!"),
  });
};

export const useEndSession = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationKey: ["endSession"],
    mutationFn: async (id) => {
      const token = await getToken();
      return sessionApi.endSession(id, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    },
    onSuccess: () => toast.success("Session ended successfully!"),
  });
};
