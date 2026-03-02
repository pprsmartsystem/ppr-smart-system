'use client';
import { motion } from 'framer-motion';
import { CreditCardIcon, BuildingOfficeIcon, Cog6ToothIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

const pages = {
  cards: { title: 'Cards Management', icon: CreditCardIcon },
  corporates: { title: 'Corporate Accounts', icon: BuildingOfficeIcon },
  settings: { title: 'System Settings', icon: Cog6ToothIcon },
  transactions: { title: 'All Transactions', icon: DocumentChartBarIcon },
};

export default function PlaceholderPage({ type = 'cards' }) {
  const { title, icon: Icon } = pages[type] || pages.cards;
  
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">Manage {title.toLowerCase()}</p>
      </motion.div>
      <div className="stats-card text-center py-12">
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">Coming soon</p>
      </div>
    </div>
  );
}
