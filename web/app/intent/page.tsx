'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://ridebuddy0-1.onrender.com/api').replace(/\/+$/, '');

type IntentResponse = {
  driverId?: {
    _id?: string;
    name?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    numberPlate?: string;
  };
  status?: 'pending' | 'accepted' | 'declined';
};

type IntentItem = {
  _id: string;
  source: string;
  destination: string;
  dateTime: string;
  status?: 'open' | 'matched' | 'expired';
  userId?: { _id?: string; name?: string };
  responses?: IntentResponse[];
  conversationId?: { _id?: string } | string | null;
};

type NotificationItem = {
  _id: string;
  type: 'INTENT_REQUEST' | 'RIDE_ACCEPTED';
  body: string;
  data?: { conversationId?: string };
};

const getToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem('token') || '';
};

const apiRequest = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'Request failed');
  }
  return payload;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }
  return date.toLocaleString();
};

const formatRelative = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const diffHours = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60));
  if (diffHours <= 0) return 'starting soon';
  if (diffHours === 1) return 'in 1 hour';
  return `in ${diffHours} hours`;
};

export default function TravelIntentPage() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publicIntents, setPublicIntents] = useState<IntentItem[]>([]);
  const [myIntents, setMyIntents] = useState<IntentItem[]>([]);
  const [busyId, setBusyId] = useState('');
  const [skippedIntentIds, setSkippedIntentIds] = useState<string[]>([]);
  const [banner, setBanner] = useState<NotificationItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const isLoggedIn = Boolean(getToken());

  const loadData = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const [nearby, mine, notifications] = await Promise.all([
      apiRequest('/intents/nearby'),
      apiRequest('/intents/my-intents'),
      apiRequest('/notifications')
    ]);

    setPublicIntents((nearby.data || []).filter((item: IntentItem) => !skippedIntentIds.includes(item._id)));
    setMyIntents(mine.data || []);
    const accepted = (notifications.data || []).find((notification: NotificationItem) => notification.type === 'RIDE_ACCEPTED');
    setBanner(accepted || null);
  }, [isLoggedIn, skippedIntentIds]);

  useEffect(() => {
    loadData()
      .catch((error) => setFeedback(error.message))
      .finally(() => setLoading(false));
  }, [loadData]);

  const handlePostIntent = async () => {
    if (!source.trim() || !destination.trim() || !dateTime) {
      setFeedback('Please fill source, destination and date/time.');
      return;
    }

    try {
      setSubmitting(true);
      setFeedback('');
      await apiRequest('/intents', {
        method: 'POST',
        body: JSON.stringify({
          source: source.trim(),
          destination: destination.trim(),
          dateTime: new Date(dateTime).toISOString()
        })
      });
      setSource('');
      setDestination('');
      setDateTime('');
      setFeedback('Your request has been sent! Drivers nearby will be notified.');
      await loadData();
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const respond = async (intentId: string, action: 'accept' | 'decline') => {
    try {
      setBusyId(intentId);
      const response = await apiRequest(`/intents/${intentId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });

      if (action === 'decline') {
        setSkippedIntentIds((prev) => [...prev, intentId]);
      } else {
        setFeedback("Request sent! You'll be connected via chat.");
        if (response?.data?.conversationId) {
          window.location.href = `/chat?conversationId=${response.data.conversationId}`;
          return;
        }
      }
      await loadData();
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setBusyId('');
    }
  };

  const cancelIntent = async (intentId: string) => {
    try {
      setBusyId(intentId);
      await apiRequest(`/intents/${intentId}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setBusyId('');
    }
  };

  const openBannerChat = async () => {
    if (!banner) return;
    try {
      await apiRequest(`/notifications/${banner._id}/read`, { method: 'PUT' });
      setBanner(null);
      if (banner?.data?.conversationId) {
        window.location.href = `/chat?conversationId=${banner.data.conversationId}`;
      } else {
        window.location.href = '/chat';
      }
    } catch (error) {
      setFeedback((error as Error).message);
    }
  };

  const visiblePublicIntents = useMemo(
    () => publicIntents.filter((intent) => !skippedIntentIds.includes(intent._id)),
    [publicIntents, skippedIntentIds]
  );

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="text-primary hover:underline mb-6 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Travel Intent</h1>
        <p className="text-gray-text mb-6">Post intent and connect with nearby drivers automatically.</p>

        {banner ? (
          <button className="card w-full mb-4 text-left border border-orange-300 bg-orange-50" onClick={openBannerChat}>
            <div className="font-semibold text-orange-900">🎉 {banner.body}</div>
            <div className="text-sm text-orange-700 mt-1">Open Chat →</div>
          </button>
        ) : null}

        {!isLoggedIn ? (
          <div className="card mb-6">
            <p className="text-gray-text">Please login first to post intents and offer rides.</p>
          </div>
        ) : (
          <div className="card mb-8">
            <h3 className="text-xl font-bold mb-5">Post Intent</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="📍 Source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="🏁 Destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="input-field"
              />
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(event) => setDateTime(event.target.value)}
                className="input-field"
              />
              <button disabled={submitting || loading} className="btn-primary w-full" onClick={handlePostIntent}>
                {submitting ? 'Posting...' : 'Post Intent'}
              </button>
            </div>
          </div>
        )}

        {feedback ? <p className="mb-6 text-sm text-primary">{feedback}</p> : null}

        <h3 className="text-xl font-bold mb-4">My Active Intents</h3>
        {myIntents.length === 0 ? (
          <div className="card mb-8 text-gray-text">No active intents yet.</div>
        ) : (
          <div className="space-y-4 mb-8">
            {myIntents.map((intent) => {
              const accepted = (intent.responses || []).find((response) => response.status === 'accepted');
              const pendingCount = (intent.responses || []).filter((response) => response.status === 'pending').length;
              const conversationId =
                typeof intent.conversationId === 'string' ? intent.conversationId : intent.conversationId?._id;

              if (accepted) {
                return (
                  <div key={intent._id} className="card">
                    <div className="font-semibold text-lg">🗺️ {intent.source} → {intent.destination}</div>
                    <div className="mt-2 text-green-700 font-semibold">✅ {accepted.driverId?.name || 'Driver'} accepted!</div>
                    <div className="text-sm text-gray-text mt-1">
                      {accepted.driverId?.vehicleBrand || 'Vehicle'} {accepted.driverId?.vehicleModel || ''}
                      {accepted.driverId?.numberPlate ? ` • ${accepted.driverId.numberPlate}` : ''}
                    </div>
                    {conversationId ? (
                      <a href={`/chat?conversationId=${conversationId}`} className="btn-secondary inline-block mt-4">
                        💬 Open Chat
                      </a>
                    ) : null}
                  </div>
                );
              }

              return (
                <div key={intent._id} className="card">
                  <div className="font-semibold text-lg">🗺️ {intent.source} → {intent.destination}</div>
                  <div className="text-sm text-gray-text mt-1">📅 {formatDate(intent.dateTime)}</div>
                  <div className="mt-2 text-yellow-700 font-semibold">Status: 🟡 Waiting for driver</div>
                  <div className="text-sm text-gray-text mt-2">[{pendingCount} drivers notified]</div>
                  <button
                    className="btn-secondary mt-4"
                    disabled={busyId === intent._id}
                    onClick={() => cancelIntent(intent._id)}
                  >
                    ❌ Cancel Intent
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <h3 className="text-xl font-bold mb-4">Public Intents</h3>
        {visiblePublicIntents.length === 0 ? (
          <div className="card text-gray-text">No public intents right now.</div>
        ) : (
          <div className="space-y-4">
            {visiblePublicIntents.map((intent) => (
              <div key={intent._id} className="card">
                <div className="font-semibold">👤 {intent.userId?.name || 'Passenger'}</div>
                <div className="font-semibold text-lg mt-1">🗺️ {intent.source} → {intent.destination}</div>
                <div className="text-sm text-gray-text mt-2">📅 {formatDate(intent.dateTime)}</div>
                <div className="text-sm text-gray-text">⏱️ {formatRelative(intent.dateTime)}</div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="btn-primary flex-1"
                    disabled={busyId === intent._id}
                    onClick={() => respond(intent._id, 'accept')}
                  >
                    🚗 Offer Ride
                  </button>
                  <button
                    className="btn-secondary flex-1"
                    disabled={busyId === intent._id}
                    onClick={() => respond(intent._id, 'decline')}
                  >
                    ❌ Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
