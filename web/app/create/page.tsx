'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreateRidePage() {
  const [step, setStep] = useState(1);
  const [seats, setSeats] = useState(4);
  const [price, setPrice] = useState(50);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="text-primary hover:underline mb-6 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Create a Ride</h1>
        <p className="text-gray-text mb-8">Share your journey and split costs</p>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              1
            </div>
            <span className={`text-sm ${step >= 1 ? 'text-primary font-semibold' : 'text-gray-400'}`}>Route</span>
          </div>
          
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-primary transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              2
            </div>
            <span className={`text-sm ${step >= 2 ? 'text-primary font-semibold' : 'text-gray-400'}`}>Details</span>
          </div>
          
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-primary transition-all ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              3
            </div>
            <span className={`text-sm ${step >= 3 ? 'text-primary font-semibold' : 'text-gray-400'}`}>Confirm</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* From Location */}
          <div className="card">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📍</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">Starting Point</label>
                <input type="text" placeholder="Enter starting location" className="input-field" />
              </div>
            </div>
          </div>

          {/* To Location */}
          <div className="card">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🏁</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">Destination</label>
                <input type="text" placeholder="Enter destination" className="input-field" />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="card">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📅</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">Date & Time</label>
                <input type="datetime-local" className="input-field" />
              </div>
            </div>
          </div>

          {/* Price Slider */}
          <div className="card">
            <div className="flex items-center gap-4">
              <span className="text-3xl">💰</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">Price per Seat</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="10" 
                    max="200" 
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border-2 border-gray-200 rounded-input text-center font-bold"
                    />
                    <span className="text-gray-text">₹</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seats Counter */}
          <div className="card">
            <div className="flex items-center gap-4">
              <span className="text-3xl">👥</span>
              <div className="flex-1">
                <label className="text-sm text-gray-text block mb-2">Available Seats</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{seats}</span>
                  <button 
                    onClick={() => setSeats(Math.min(8, seats + 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Card */}
          <div className="bg-warning/10 border-2 border-warning/30 rounded-card p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                Make sure your vehicle details are up to date.{' '}
                <Link href="/profile" className="text-primary font-semibold hover:underline">
                  Edit Profile →
                </Link>
              </p>
            </div>
          </div>

          {/* Publish Button */}
          <button className="btn-primary w-full text-lg py-4">
            Publish Ride
          </button>
        </div>
      </div>
    </div>
  );
}
