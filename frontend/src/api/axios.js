import axios from "axios";

const api = axios.create({
  baseURL: "http://fs12025.jcarlos19.com:5000/api",
});

// Adjuntar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
