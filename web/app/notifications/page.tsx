'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = 'https://ridebuddy0-1.onrender.com/api';

type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  type: string;
  data?: { conversationId?: string };
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState('');

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login to view notifications.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const payload = await response.json().catch(() => ({ success: false, message: 'Invalid response' }));
    if (!response.ok || !payload.success) {
      setMessage(payload.message || 'Unable to load notifications.');
      return;
    }
    setNotifications(payload.data || []);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadNotifications().catch((error) => setMessage(error.message));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadNotifications();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {message ? <p className="mb-4 text-sm text-primary">{message}</p> : null}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="card text-gray-text">No unread notifications.</div>
        ) : (
          notifications.map((item) => (
            <div key={item._id} className="card">
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-gray-text mt-2">{item.body}</div>
              <div className="mt-4 flex gap-2">
                {item?.data?.conversationId ? (
                  <a className="btn-secondary" href={`/chat?conversationId=${item.data.conversationId}`}>
                    Open Chat
                  </a>
                ) : null}
                <button className="btn-primary" onClick={() => markRead(item._id)}>
                  Mark Read
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
