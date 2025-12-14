import axios from "axios";

const API_URL = "http://fs12025.jcarlos19.com:5000/api/usuarios/";

// Iniciar sesión
const login = async (userData) => {
  const response = await axios.post(API_URL + "login", userData);

  if (response.data) {
    localStorage.setItem("usuario", JSON.stringify(response.data));
  }

  return response.data;
};

// Cerrar sesión
const logout = () => {
  localStorage.removeItem("usuario");
};

const authService = {
  login,
  logout,
};

export default authService;
