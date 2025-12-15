import api from './axios';

export const getNotifications = async () => {
    const res = await api.get('/notificaciones');
    return res.data;
};

export const getUnreadCount = async () => {
    const res = await api.get('/notificaciones/no-leidas');
    return res.data;
};

export const markAsRead = async (id) => {
    const res = await api.put(`/notificaciones/${id}/leer`);
    return res.data;
};

export const markAllAsRead = async () => {
    const res = await api.put('/notificaciones/leer-todas');
    return res.data;
};

