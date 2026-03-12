'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import StatsCard from '@/components/ui/StatsCard';
import VirtualCard from '@/components/cards/VirtualCard';
import {
  WalletIcon,
  CreditCardIcon,
  GiftIcon,
  DocumentChartBarIcon,
  PlusIcon,
  ArrowUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingSettlement, setPendingSettlement] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      
      if (!userRes.ok) {
        // Not authenticated, redirect to login
        window.location.href = '/login';
        return;
      }
      
      const userData = await userRes.json();
      setUser(userData);
      
      const [cardsRes, transactionsRes, settlementRes] = await Promise.all([
        fetch('/api/user/cards'),
        fetch('/api/user/transactions?limit=5'),
        fetch('/api/user/settlement'),
      ]);

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData.cards || []);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }

      if (settlementRes.ok) {
        const settlementData = await settlementRes.json();
        setPendingSettlement(settlementData.totalPending || 0);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCardBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const activeCards = cards.filter(card => card.status === 'active').length;

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
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Manage your wallet, cards, and rewards</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/user/cards" className="btn-primary">
            <CreditCardIcon className="w-4 h-4 mr-2" />
            New Card
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Wallet Balance"
          value={formatCurrency(user?.walletBalance || 0)}
          icon={WalletIcon}
          trend="up"
          trendValue="+5%"
          color="green"
          delay={0}
        />
        <StatsCard
          title="Active Cards"
          value={activeCards.toString()}
          icon={CreditCardIcon}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="Card Balance"
          value={formatCurrency(totalCardBalance)}
          icon={ArrowUpIcon}
          color="purple"
          delay={0.2}
        />
        <StatsCard
          title="Pending Settlement"
          value={formatCurrency(pendingSettlement)}
          icon={ClockIcon}
          color="orange"
          delay={0.3}
          subtitle="Next day to wallet"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/user/vouchers"
            className="p-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <GiftIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Buy Vouchers</h4>
            <p className="text-sm opacity-90">Gift cards & rewards</p>
          </Link>
          <Link
            href="/user/cards"
            className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <CreditCardIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Manage Cards</h4>
            <p className="text-sm opacity-90">View & control cards</p>
          </Link>
          <Link
            href="/user/transactions"
            className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <DocumentChartBarIcon className="w-8 h-8 mb-2" />
            <h4 className="font-semibold">Transactions</h4>
            <p className="text-sm opacity-90">View transaction history</p>
          </Link>
        </div>
      </motion.div>

      {/* Cards & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="stats-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Cards</h3>
            <Link href="/user/cards" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          {cards.length > 0 ? (
            <div className="space-y-4">
              {cards.slice(0, 2).map((card) => (
                <VirtualCard key={card._id} card={card} className="max-w-none" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No cards yet</p>
              <Link href="/user/cards" className="btn-primary">
                Create Your First Card
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="stats-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link href="/user/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}