'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import StatsCard from '@/components/ui/StatsCard';
import {
  UserGroupIcon,
  WalletIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';

export default function DistributorDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    walletBalance: 0,
    totalCards: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/distributor/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your users and wallet</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/distributor/users" className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Wallet"
          value={formatCurrency(stats.walletBalance)}
          icon={WalletIcon}
          color="green"
          delay={0}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={UserGroupIcon}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="Total Cards"
          value={stats.totalCards.toString()}
          icon={CreditCardIcon}
          color="purple"
          delay={0.2}
        />
        <StatsCard
          title="Transactions"
          value={stats.totalTransactions.toString()}
          icon={DocumentChartBarIcon}
          color="orange"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="stats-card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/distributor/users"
            className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <UserGroupIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Manage Users</h4>
            <p className="text-sm opacity-90">Create & manage users</p>
          </Link>
          <Link
            href="/distributor/wallet"
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <WalletIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Recharge Wallet</h4>
            <p className="text-sm opacity-90">Add balance to users</p>
          </Link>
          <Link
            href="/distributor/reports"
            className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <DocumentChartBarIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Reports</h4>
            <p className="text-sm opacity-90">View user reports</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
