import api from "../../api/axios";

const register = async (data) => {
  const res = await api.post("/usuarios", data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

const login = async (data) => {
  const res = await api.post("/usuarios/login", data);
  
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
  }

  return res.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getMe = async () => {
  const res = await api.get("/usuarios/actual");
  if (res.data) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

const updateSubjects = async (subjects) => {
  const res = await api.put("/usuarios/subjects", { subjects });
  if (res.data) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

const updateFavoritos = async (libros) => {
  const res = await api.put("/usuarios/favoritos", { libros });
  if (res.data) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

const updateAvatar = async (avatarUrl) => {
  const res = await api.put("/usuarios/avatar", { avatarUrl });
  if (res.data) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

const authService = {
  register,
  login,
  logout,
  getMe,
  updateSubjects,
  updateFavoritos,
  updateAvatar,
};

export default authService;
