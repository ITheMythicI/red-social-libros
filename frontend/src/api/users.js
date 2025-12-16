import api from "./axios";

export const searchUsers = async (q) => {
  const res = await api.get("/usuarios/buscar", {
    params: { q },
  });
  return res.data;
};

export const getUser = async (userId) => {
  const res = await api.get(`/usuarios/${userId}`);
  return res.data;
};

export const getUserProfile = async (userId) => {
  const res = await api.get(`/usuarios/${userId}`);
  return res.data;
};

export const getFollowersCount = async () => {
  const res = await api.get("/usuarios/me/contadores");
  return res.data;
};

export const followUser = async (userId) => {
  const res = await api.put(`/usuarios/${userId}/seguir`);
  return res.data;
};

export const blockUser = async (userId) => {
  const res = await api.put(`/usuarios/${userId}/bloquear`);
  return res.data;
};

export const getBlockedUsers = async () => {
  const res = await api.get("/usuarios/bloqueados");
  return res.data;
};
