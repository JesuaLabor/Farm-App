export type NotificationType =
  | 'order_status'
  | 'payment_status'
  | 'produce_inquiry'
  | 'community_reply'
  | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}
