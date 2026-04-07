'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockIntents = [
  { id: 1, user: 'Rahul Kumar', from: 'Allahabad', to: 'Varanasi', when: 'Tomorrow 9 AM' },
  { id: 2, user: 'Priya Singh', from: 'Lucknow', to: 'Kanpur', when: 'Today 3 PM' },
];

export default function TravelIntentPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateTime, setDateTime] = useState('');

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="text-primary hover:underline mb-6 inline-block">
          ← Back to home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🧭</span>
          <h1 className="text-3xl font-bold">Travel Intent</h1>
        </div>
        <p className="text-gray-text mb-8">Let others know where you want to go</p>

        {/* Create Intent Form */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-6">Create Your Intent</h3>
          
          <div className="space-y-6">
            {/* From Location */}
            <div className="flex items-center gap-4">
              <span className="text-3xl">📍</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">From</label>
                <input 
                  type="text" 
                  placeholder="Starting location"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="input-field" 
                />
              </div>
            </div>

            {/* To Location */}
            <div className="flex items-center gap-4">
              <span className="text-3xl">🏁</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">To</label>
                <input 
                  type="text" 
                  placeholder="Destination"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="input-field" 
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-4">
              <span className="text-3xl">📅</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">When</label>
                <input 
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="input-field" 
                />
              </div>
            </div>

            <button className="btn-primary w-full">
              Post Intent
            </button>
          </div>
        </div>

        {/* Public Intents */}
        <h3 className="text-xl font-bold mb-4">Public Travel Intents</h3>
        
        <div className="space-y-4">
          {mockIntents.map((intent) => (
            <div key={intent.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {intent.user.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold mb-1">{intent.user}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {intent.from} → {intent.to}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-text mb-3">
                    <span>🕐</span>
                    <span>{intent.when}</span>
                  </div>
                  <button className="btn-secondary">
                    Match Ride
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockIntents.length === 0 && (
          <div className="text-center py-12 card">
            <div className="text-6xl mb-4">🧭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No intents yet</h3>
            <p className="text-gray-text">Be the first to post a travel intent!</p>
          </div>
        )}
      </div>
    </div>
  );
}
