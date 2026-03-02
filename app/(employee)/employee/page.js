'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import StatsCard from '@/components/ui/StatsCard';
import {
  WalletIcon,
  CreditCardIcon,
  GiftIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    allowanceBalance: 0,
    activeCards: 0,
    vouchersUsed: 0,
    transactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        
        // Mock stats
        setStats({
          allowanceBalance: userData.walletBalance || 0,
          activeCards: 2,
          vouchersUsed: 5,
          transactions: 12,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Manage your corporate benefits and allowances</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/employee/vouchers" className="btn-primary">
            <GiftIcon className="w-4 h-4 mr-2" />
            Browse Vouchers
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Allowance Balance"
          value={formatCurrency(stats.allowanceBalance)}
          icon={WalletIcon}
          color="green"
          delay={0}
        />
        <StatsCard
          title="Active Cards"
          value={stats.activeCards.toString()}
          icon={CreditCardIcon}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="Vouchers Used"
          value={stats.vouchersUsed.toString()}
          icon={GiftIcon}
          color="purple"
          delay={0.2}
        />
        <StatsCard
          title="Transactions"
          value={stats.transactions.toString()}
          icon={DocumentChartBarIcon}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="stats-card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/employee/allowance"
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <WalletIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">View Allowance</h4>
            <p className="text-sm opacity-90">Check your balance</p>
          </Link>
          <Link
            href="/employee/cards"
            className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <CreditCardIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">My Cards</h4>
            <p className="text-sm opacity-90">Manage your cards</p>
          </Link>
          <Link
            href="/employee/vouchers"
            className="p-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <GiftIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Gift Vouchers</h4>
            <p className="text-sm opacity-90">Redeem rewards</p>
          </Link>
          <Link
            href="/employee/transactions"
            className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <DocumentChartBarIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Transactions</h4>
            <p className="text-sm opacity-90">View history</p>
          </Link>
        </div>
      </motion.div>

      {/* Benefits Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="stats-card bg-gradient-to-r from-primary-50 to-violet-50 border-primary-200"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <GiftIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Corporate Benefits</h3>
            <p className="text-gray-600 mb-4">
              You have access to exclusive corporate benefits and allowances. Use your allowance to purchase gift vouchers, 
              manage virtual cards, and enjoy various rewards provided by your company.
            </p>
            <Link href="/employee/vouchers" className="text-primary-600 hover:text-primary-700 font-medium">
              Explore Benefits →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}