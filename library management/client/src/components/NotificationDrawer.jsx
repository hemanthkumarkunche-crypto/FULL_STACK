import React from 'react';
import { X, Bell, Check, Clock, AlertTriangle, Bookmark, BookOpen } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onRefresh
}) {
  if (!isOpen) return null;

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OVERDUE_ALERT':
        return <AlertTriangle size={16} color="#ef4444" />;
      case 'DUE_REMINDER':
        return <Clock size={16} color="#f59e0b" />;
      case 'HOLD_READY':
        return <Bookmark size={16} color="#06b6d4" />;
      default:
        return <BookOpen size={16} color="#818cf8" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '380px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: '0',
          borderLeft: '1px solid var(--border-color)',
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideLeft 0.25s ease-out'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Notifications</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mark all as read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.isRead && handleMarkRead(item._id)}
                style={{
                  background: item.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                  border: item.isRead ? '1px solid var(--border-color)' : '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  marginBottom: '10px',
                  cursor: item.isRead ? 'default' : 'pointer',
                  position: 'relative'
                }}
              >
                {!item.isRead && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#6366f1'
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {getIcon(item.type)}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '6px' }}>
                  {item.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
