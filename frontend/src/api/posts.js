import api from "./axios";

export const createPost = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};

export const getPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const getPost = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const toggleLike = async (postId) => {
  const res = await api.put(`/posts/${postId}/like`);
  return res.data;
};

export const toggleDislike = async (postId) => {
  const res = await api.put(`/posts/${postId}/dislike`);
  return res.data;
};

export const createComment = async (postId, texto) => {
  const res = await api.post(`/posts/${postId}/comentarios`, { texto });
  return res.data;
};

export const toggleLikeComment = async (postId, comentarioId) => {
  const res = await api.put(`/posts/${postId}/comentarios/${comentarioId}/like`);
  return res.data;
};

export const toggleDislikeComment = async (postId, comentarioId) => {
  const res = await api.put(`/posts/${postId}/comentarios/${comentarioId}/dislike`);
  return res.data;
};
