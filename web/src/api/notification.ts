import { apiClient } from './index';
import type { NotificationItem, NotificationUnreadCountResponse } from '../types/notification';

export const notificationApi = {
  listNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[]>('/api/notifications');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<NotificationUnreadCountResponse>('/api/notifications/unread-count');
    return res.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/api/notifications/read-all');
  },
};
