'use client';

import Link from 'next/link';

export default function RideDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section with Route */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-light p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">
            ← Back to rides
          </Link>
          
          <div className="flex items-center justify-center gap-4 mt-8 text-white">
            <div className="text-center">
              <div className="text-3xl mb-2">📍</div>
              <div className="text-2xl font-bold">Zafarabad</div>
            </div>
            
            <div className="flex-1 max-w-xs border-t-2 border-dashed border-white/50"></div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🏁</div>
              <div className="text-2xl font-bold">Jaunpur</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm text-gray-text">Date</div>
            <div className="font-bold">Today</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-sm text-gray-text">Time</div>
            <div className="font-bold">10:00 AM</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-text">Price</div>
            <div className="font-bold text-success">₹50</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm text-gray-text">Seats</div>
            <div className="font-bold">4 available</div>
          </div>
        </div>

        {/* Driver Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Driver Information</h3>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              SG
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">Sujal Giri</div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                <span className="text-sm text-gray-text">5.0</span>
              </div>
              <span className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full mt-1">
                Top Rated
              </span>
            </div>
          </div>
          
          {/* Vehicle Details */}
          <div className="bg-gray-50 rounded-input p-4">
            <div className="text-sm text-gray-text mb-2">Vehicle Details</div>
            <div className="font-semibold">🚗 Honda City</div>
            <div className="text-sm text-gray-text">UP 70 AB 1234</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <button className="btn-primary w-full">
              Join This Ride
            </button>
            <button className="btn-secondary w-full">
              Message Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
