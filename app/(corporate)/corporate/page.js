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
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';

export default function CorporateDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    walletBalance: 0,
    activeCards: 0,
    monthlySpend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now
      setStats({
        totalEmployees: 5,
        walletBalance: 50000,
        activeCards: 12,
        monthlySpend: 8500,
      });
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
          <h1 className="text-3xl font-bold text-gray-900">Corporate Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your employees and corporate rewards</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/corporate/employees" className="btn-secondary">
            <UserGroupIcon className="w-4 h-4 mr-2" />
            Manage Employees
          </Link>
          <Link href="/corporate/wallet" className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Funds
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees.toString()}
          icon={UserGroupIcon}
          trend="up"
          trendValue="+2"
          color="blue"
          delay={0}
        />
        <StatsCard
          title="Wallet Balance"
          value={formatCurrency(stats.walletBalance)}
          icon={WalletIcon}
          trend="up"
          trendValue="+12%"
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Active Cards"
          value={stats.activeCards.toString()}
          icon={CreditCardIcon}
          color="purple"
          delay={0.2}
        />
        <StatsCard
          title="Monthly Spend"
          value={formatCurrency(stats.monthlySpend)}
          icon={ArrowUpIcon}
          trend="up"
          trendValue="+8%"
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
            href="/corporate/employees"
            className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <UserGroupIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Add Employee</h4>
            <p className="text-sm opacity-90">Onboard new team members</p>
          </Link>
          <Link
            href="/corporate/wallet"
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <WalletIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Bulk Credit</h4>
            <p className="text-sm opacity-90">Distribute allowances</p>
          </Link>
          <Link
            href="/corporate/cards"
            className="p-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <CreditCardIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Issue Cards</h4>
            <p className="text-sm opacity-90">Create employee cards</p>
          </Link>
          <Link
            href="/corporate/reports"
            className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <DocumentChartBarIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Reports</h4>
            <p className="text-sm opacity-90">Export & analyze data</p>
          </Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="stats-card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Employee added', user: 'Alice Wilson', time: '2 hours ago', type: 'employee' },
            { action: 'Allowance distributed', user: '5 employees', time: '1 day ago', type: 'wallet' },
            { action: 'Card issued', user: 'Bob Brown', time: '2 days ago', type: 'card' },
            { action: 'Report generated', user: 'Monthly Report', time: '3 days ago', type: 'report' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'employee' ? 'bg-blue-500' :
                  activity.type === 'wallet' ? 'bg-green-500' :
                  activity.type === 'card' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}