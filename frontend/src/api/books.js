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
