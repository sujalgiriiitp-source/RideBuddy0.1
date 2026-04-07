'use client';

import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header Gradient Banner */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-light p-8 md:p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4 border-4 border-white/30">
          SG
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Sujal Giri</h1>
        <p className="text-white/80">Member since 2024</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">12</div>
            <div className="text-sm text-gray-text">Total Rides</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary flex items-center justify-center gap-1">
              5.0 ⭐
            </div>
            <div className="text-sm text-gray-text">Rating</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">8</div>
            <div className="text-sm text-gray-text">Reviews</div>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">📧</span>
            <div className="flex-1">
              <div className="text-sm text-gray-text">Email</div>
              <div className="font-semibold">sujal@ridebuddy.com</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-3xl">📱</span>
            <div className="flex-1">
              <div className="text-sm text-gray-text">Phone</div>
              <div className="font-semibold">+91 98765 43210</div>
            </div>
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🚗</span>
            Vehicle Information
          </h3>
          <div className="bg-gray-50 rounded-input p-4">
            <div className="font-bold text-lg mb-1">Honda City</div>
            <div className="text-gray-text">UP 70 AB 1234</div>
            <div className="text-sm text-gray-text mt-2">Sedan • 4 Seats • White</div>
          </div>
          <button className="btn-secondary w-full mt-4">
            Update Vehicle
          </button>
        </div>

        {/* Subscription Plan Card */}
        <div className="card border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>💳</span>
              Subscription Plan
            </h3>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-bold rounded-full">
              FREE
            </span>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-text mb-2">Daily Rides Used</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '0%' }}></div>
              </div>
              <span className="text-sm font-bold">0/5</span>
            </div>
          </div>
          
          <Link href="/subscription" className="btn-primary w-full">
            Upgrade to Premium
          </Link>
        </div>

        {/* Action Buttons */}
        <button className="btn-secondary w-full">
          Edit Profile
        </button>
        
        <button className="w-full px-6 py-3 border-2 border-error text-error rounded-input font-semibold hover:bg-error hover:text-white">
          Logout
        </button>
      </div>
    </div>
  );
}
