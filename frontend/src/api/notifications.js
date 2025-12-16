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

export const deleteNotification = async (id) => {
    const res = await api.delete(`/notificaciones/${id}`);
    return res.data;
};

export const deleteAllNotifications = async () => {
    const res = await api.delete('/notificaciones/eliminar-todas/todas');
    return res.data;
};

