import api from "../../api/axios";

const register = async (data) => {
  const res = await api.post("/usuarios", data);
  return res.data;
};

const login = async (data) => {
  const res = await api.post("/usuarios/login", data);
  
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }

  return res.data;
};

const logout = () => {
  localStorage.removeItem("token");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
