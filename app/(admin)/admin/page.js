'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/ui/StatsCard';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#059669', '#DC2626'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCorporates: 0,
    totalCards: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData);
        setPieData(data.pieData);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your platform</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary">
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={UserGroupIcon}
          trend="up"
          trendValue="+12%"
          color="blue"
          delay={0}
        />
        <StatsCard
          title="Total Corporates"
          value={stats.totalCorporates.toLocaleString()}
          icon={BuildingOfficeIcon}
          trend="up"
          trendValue="+8%"
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Active Cards"
          value={stats.totalCards.toLocaleString()}
          icon={CreditCardIcon}
          trend="up"
          trendValue="+15%"
          color="purple"
          delay={0.2}
        />
        <StatsCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={DocumentChartBarIcon}
          trend="up"
          trendValue="+22%"
          color="orange"
          delay={0.3}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend="up"
          trendValue="+18%"
          color="primary"
          delay={0.4}
        />
        <StatsCard
          title="Monthly Growth"
          value={`${stats.monthlyGrowth}%`}
          icon={ArrowTrendingUpIcon}
          trend="up"
          trendValue="+5%"
          color="red"
          delay={0.5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="stats-card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Transactions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="transactions" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="stats-card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="stats-card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New user registration', user: 'john@example.com', time: '2 minutes ago', type: 'user' },
            { action: 'Corporate account created', user: 'TechCorp Inc.', time: '15 minutes ago', type: 'corporate' },
            { action: 'Virtual card issued', user: 'jane@example.com', time: '1 hour ago', type: 'card' },
            { action: 'Transaction completed', user: 'mike@example.com', time: '2 hours ago', type: 'transaction' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'corporate' ? 'bg-green-500' :
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