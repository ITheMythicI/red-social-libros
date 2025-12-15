import api from "./axios";

export const searchBooks = async (q, startIndex = 0, maxResults = 12) => {
  const res = await api.get("/libros", {
    params: { q, startIndex, maxResults },
  });
  return res.data;
};

export const getBook = async (id) => {
  const res = await api.get(`/libros/${id}`);
  return res.data;
};

export const getBookSuggestions = async () => {
  const res = await api.get("/libros/sugerencias/recomendaciones");
  return res.data;
};

export const getAuthorBiography = async (nombre) => {
  const res = await api.get(`/libros/autor/${encodeURIComponent(nombre)}`);
  return res.data;
};

export const getCuriousFacts = async () => {
  const res = await api.get("/libros/datos-curiosos/aleatorios");
  return res.data;
};