import api from './api';

const NotificationService = {
  sendNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}`);
    return response.data;
  },
};

export default NotificationService;