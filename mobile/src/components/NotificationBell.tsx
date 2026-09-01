import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { NotificationItem, NotificationType } from '../types/app';
import { Spinner } from './Spinner';

const notifIcons: Record<NotificationType, string> = {
  order_status: '🚚',
  payment_status: '💵',
  produce_inquiry: '🌾',
  community_reply: '💬',
  system: '📢',
};

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showSheet, setShowSheet] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUnreadCount = async () => {
    try {
      const count = await api.getUnreadNotifCount();
      setUnreadCount(count);
    } catch (e) {
      // Ignore if unauthenticated
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setNotifications(data);
      const unread = data.filter((n: NotificationItem) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error('Failed to load mobile notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showSheet) {
      fetchNotifications();
    }
  }, [showSheet]);

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await api.markNotifAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Failed to mark read:', e);
      }
    }
    setShowSheet(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotifsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const formatTime = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <>
      <button
        onClick={() => setShowSheet(true)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 10,
          background: unreadCount > 0 ? '#fef9c3' : '#f1f5f9',
          border: unreadCount > 0 ? '1.5px solid #ca8a04' : '1.5px solid #cbd5e1',
          color: unreadCount > 0 ? '#ca8a04' : '#64748b',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              padding: '0 3px',
              borderRadius: 8,
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              border: '1.5px solid #fff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Bottom Sheet Drawer for Mobile */}
      {showSheet && (
        <div className="modal-backdrop" onClick={() => setShowSheet(false)}>
          <div
            className="modal-sheet"
            style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="modal-title">Notifications</div>
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#ca8a04',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 8,
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ca8a04',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowSheet(false)}>✕</button>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ overflowY: 'auto', padding: '8px 16px 20px', flex: 1 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Spinner size={20} />
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>🔔</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No Notifications</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>You are up to date!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: notif.isRead ? '#f8fafc' : '#fefce8',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {notifIcons[notif.type] ?? '🔔'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: notif.isRead ? 600 : 800, color: '#0f172a' }}>
                            {notif.title}
                          </span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2, lineHeight: 1.3 }}>
                          {notif.message}
                        </div>
                      </div>

                      {!notif.isRead && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#ca8a04',
                            marginTop: 4,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
