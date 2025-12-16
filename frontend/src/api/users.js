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
