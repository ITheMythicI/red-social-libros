import api from "./axios";
import { refreshNotifications } from "../components/NotificationBell";

export const createPost = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};

export const getPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const getUserPosts = async (userId) => {
  const res = await api.get(`/posts/usuario/${userId}`);
  return res.data;
};

export const getPost = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const toggleLike = async (postId) => {
  const res = await api.put(`/posts/${postId}/like`);
  //Refrescar notificaciones cuando se da like
  refreshNotifications();
  return res.data;
};

export const toggleDislike = async (postId) => {
  const res = await api.put(`/posts/${postId}/dislike`);
  return res.data;
};

export const createComment = async (postId, texto) => {
  const res = await api.post(`/posts/${postId}/comentarios`, { texto });
  // Refrescar notificaciones cuando se crea un comentario
  refreshNotifications();
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
