import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  Crown,
  Star,
  TrendingUp,
  BarChart2,
  Download,
  Headphones,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Upgrade = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [isLoading, setIsLoading] = useState(false);

  const currentTier = userProfile?.tier || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Star,
      price: { monthly: 0, yearly: 0 },
      description: 'Get started with basic features',
      features: [
        { text: 'Up to 10 trades', included: true },
        { text: 'Up to 5 watchlist items', included: true },
        { text: 'Basic dashboard', included: true },
        { text: 'TradingView charts', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Export data', included: false },
        { text: 'Priority support', included: false }
      ],
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      disabled: currentTier === 'free',
      highlight: false
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      price: { monthly: 9.99, yearly: 99 },
      description: 'Everything you need to track like a pro',
      features: [
        { text: 'Unlimited trades', included: true },
        { text: 'Unlimited watchlist', included: true },
        { text: 'Advanced dashboard', included: true },
        { text: 'TradingView charts', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Export data (CSV, PDF)', included: true },
        { text: 'Priority support', included: true }
      ],
      cta: currentTier === 'premium' ? 'Current Plan' : 'Upgrade Now',
      disabled: currentTier === 'premium' || currentTier === 'admin',
      highlight: true
    }
  ];

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;

    setIsLoading(true);

    // TODO: Integrate Stripe checkout
    // For now, show a coming soon message
    setTimeout(() => {
      alert('Stripe integration coming soon! For now, contact support to upgrade.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Upgrade Your Plan</h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Choose the plan that fits your trading style. Upgrade anytime.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Yearly
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative bg-gray-900 border rounded-2xl p-6 ${
                plan.highlight
                  ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'border-gray-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-emerald-500/20 to-blue-600/20'
                    : 'bg-gray-800'
                }`}>
                  <plan.icon className={`w-6 h-6 ${
                    plan.highlight ? 'text-emerald-400' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price[billingCycle]}
                  </span>
                  {plan.price[billingCycle] > 0 && (
                    <span className="text-gray-500">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <p className="text-gray-600 text-sm mt-1">
                    ${(plan.price.yearly / 12).toFixed(2)}/month
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.disabled || isLoading}
                className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  plan.highlight && !plan.disabled
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700'
                    : plan.disabled
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {isLoading && plan.highlight ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  plan.cta
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-xl font-bold text-white text-center mb-8">
            Premium Features
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: TrendingUp,
                title: 'Unlimited Trades',
                description: 'Track as many trades as you want'
              },
              {
                icon: BarChart2,
                title: 'Advanced Analytics',
                description: 'Deeper insights into your performance'
              },
              {
                icon: Download,
                title: 'Export Data',
                description: 'Download your data as CSV or PDF'
              },
              {
                icon: Headphones,
                title: 'Priority Support',
                description: 'Get help when you need it most'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20 mb-3">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-medium">{feature.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ or Contact */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Questions? Contact us at{' '}
            <a href="mailto:support@alphahunt.app" className="text-emerald-400 hover:underline">
              support@alphahunt.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
