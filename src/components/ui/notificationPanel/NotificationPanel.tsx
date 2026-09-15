'use client';

import { Bell, CheckCheck, CheckSquare, UserPlus, Clock, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { apiFetch } from '@/utils/api';
import type { Notification } from '@/utils/types';

import styles from './NotificationPanel.module.css';

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  task_assigned: <CheckSquare size={14} />,
  task_updated: <CheckSquare size={14} />,
  project_invite: <UserPlus size={14} />,
  deadline: <Clock size={14} />,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    if (isOpen) {
      const fetchNotifications = async () => {
        if (!cancelled) setIsLoading(true);

        try {
          const data = await apiFetch<Notification[]>('/notifications');
          if (!cancelled) setNotifications(data);
        } catch {
          if (!cancelled) setNotifications([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      fetchNotifications();
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleNotifReceived = (e: Event) => {
      const detail = (e as CustomEvent<Notification>).detail;
      if (detail) {
        setNotifications((prev) => [detail, ...prev.filter((n) => n.id !== detail.id)]);
      }
    };
    window.addEventListener('tf:notification-received', handleNotifReceived);
    return () => window.removeEventListener('tf:notification-received', handleNotifReceived);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return () => undefined;
    }

    const handleOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => undefined);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await apiFetch('/notifications/read-all', { method: 'POST' }).catch(() => undefined);
  };

  const handleClearOne = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' }).catch(() => undefined);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await apiFetch('/notifications/clear-all', { method: 'DELETE' }).catch(() => undefined);
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.link) {
      onClose();
      router.push(notif.link);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={panelRef} className={styles.panel} role="region" aria-label="Notifications">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bell size={15} />
          <span className={styles.headerTitle}>Notifications</span>
          {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button
              className={styles.headerActionBtn}
              onClick={markAllRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className={styles.headerActionBtn}
              onClick={handleClearAll}
              title="Clear all notifications"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {isLoading && (
          <div className={styles.loadingRow}>
            <div className={styles.spinner} />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className={styles.emptyState}>
            <Bell size={28} strokeWidth={1.5} />
            <p>No notifications</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.item} ${!notif.read ? styles.itemUnread : ''}`}
              onClick={() => handleClick(notif)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(notif)}
            >
              <div className={`${styles.typeIcon} ${styles[`type_${notif.type}`]}`}>
                {TYPE_ICONS[notif.type]}
              </div>
              <div className={styles.content}>
                <p className={styles.title}>{notif.title}</p>
                <p className={styles.message}>{notif.message}</p>
                <span className={styles.time}>{timeAgo(notif.created_at)}</span>
              </div>
              {!notif.read && <span className={styles.dot} />}
              <button
                type="button"
                className={styles.itemDeleteBtn}
                onClick={(e) => handleClearOne(e, notif.id)}
                title="Clear notification"
                aria-label="Clear notification"
              >
                <X size={13} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
