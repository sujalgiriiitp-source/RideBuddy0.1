'use client';

import Link from 'next/link';

const plans = [
  {
    name: 'FREE',
    price: '₹0',
    period: 'forever',
    color: 'gray',
    features: ['5 rides per day', 'Basic support', 'Standard features'],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    name: 'PREMIUM',
    price: '₹99',
    period: '/month',
    color: 'primary',
    popular: true,
    features: ['Unlimited rides', 'Priority support', 'Advanced analytics', 'No booking fees'],
    cta: 'Upgrade Now',
    disabled: false,
  },
  {
    name: 'PRO',
    price: '₹299',
    period: '/month',
    color: 'success',
    features: ['Everything in Premium', 'Premium badge', 'Exclusive features', '24/7 VIP support', 'Revenue sharing'],
    cta: 'Go Pro',
    disabled: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/profile" className="text-primary hover:underline mb-6 inline-block">
          ← Back to profile
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-text">Unlock premium features and save more on rides</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${plan.popular ? 'border-4 border-primary shadow-2xl scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-text mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-success text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.disabled}
                className={`w-full py-3 rounded-input font-semibold ${
                  plan.disabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="card bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-xl font-bold mb-2">Why Upgrade?</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Create unlimited rides per day</li>
                <li>• Get priority in search results</li>
                <li>• Access advanced ride analytics</li>
                <li>• Premium badge on your profile</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
