'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockRides = [
  { id: 1, from: 'Zafarabad', to: 'Jaunpur', time: '10:00 AM', driver: 'Sujal Giri', price: 50, seats: 4, status: 'available' },
  { id: 2, from: 'Allahabad', to: 'Varanasi', time: '2:30 PM', driver: 'Rahul Kumar', price: 75, seats: 2, status: 'available' },
  { id: 3, from: 'Lucknow', to: 'Kanpur', time: '9:15 AM', driver: 'Amit Singh', price: 40, seats: 0, status: 'full' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-light p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Good Morning, Sujal 👋
          </h1>
          <h2 className="text-2xl md:text-3xl text-white/90 mb-2">
            Where are you going today?
          </h2>
          <p className="text-white/70 text-lg">Find affordable campus rides</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Search Bar */}
        <div className="card shadow-lg mb-6">
          <div className="relative">
            <span className="absolute left-4 top-4 text-2xl">📍</span>
            <input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg rounded-input border-2 border-transparent focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button className={`px-4 py-2 rounded-full whitespace-nowrap ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-white border-2 border-gray-200'}`} onClick={() => setActiveFilter('all')}>
            📅 Today
          </button>
          <button className={`px-4 py-2 rounded-full whitespace-nowrap ${activeFilter === 'cheap' ? 'bg-primary text-white' : 'bg-white border-2 border-gray-200'}`} onClick={() => setActiveFilter('cheap')}>
            💰 Under ₹50
          </button>
          <button className={`px-4 py-2 rounded-full whitespace-nowrap ${activeFilter === 'available' ? 'bg-primary text-white' : 'bg-white border-2 border-gray-200'}`} onClick={() => setActiveFilter('available')}>
            🚗 Available
          </button>
        </div>

        {/* Ride Cards */}
        <div className="space-y-4">
          {mockRides.map((ride) => (
            <div key={ride.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                {/* Color Accent Bar */}
                <div className={`w-1 h-24 rounded-full ${ride.status === 'available' ? 'bg-success' : 'bg-error'}`}></div>
                
                <div className="flex-1">
                  {/* Route */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {ride.from} → {ride.to}
                  </h3>
                  
                  {/* Time & Driver */}
                  <div className="flex items-center gap-4 mb-3 text-gray-text">
                    <span className="flex items-center gap-1">
                      🕐 {ride.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {ride.driver.split(' ').map(n => n[0]).join('')}
                      </div>
                      {ride.driver}
                    </span>
                  </div>
                  
                  {/* Footer: Price, Seats, Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-success/10 text-success font-bold rounded-full">
                      ₹{ride.price}
                    </span>
                    <span className="text-gray-text">
                      👥 {ride.seats} seats
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ride.status === 'available' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {ride.status}
                    </span>
                    <Link href={`/ride/${ride.id}`} className="ml-auto text-primary font-semibold hover:underline">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockRides.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-text">Try adjusting your filters or search for a different route</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-lg">
        <div className="flex justify-around items-center px-4 py-3">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-semibold text-primary">Home</span>
          </Link>
          <Link href="/create" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary">
            <span className="text-2xl">➕</span>
            <span className="text-xs">Create</span>
          </Link>
          <Link href="/intent" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary">
            <span className="text-2xl">🧭</span>
            <span className="text-xs">Intent</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary">
            <span className="text-2xl">💬</span>
            <span className="text-xs">Chat</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary">
            <span className="text-2xl">👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
