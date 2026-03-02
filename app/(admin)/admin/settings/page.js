'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    currency: 'INR',
    currencySymbol: '₹',
    cardExpiryYears: '3',
    maxSpendingLimit: '10000',
    minSpendingLimit: '100',
    allowUserRegistration: true,
    requireApproval: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="input-field">
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
            <input type="text" value={settings.currencySymbol} onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})} className="input-field" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Card Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Expiry (Years)</label>
            <input type="number" value={settings.cardExpiryYears} onChange={(e) => setSettings({...settings, cardExpiryYears: e.target.value})} min="1" max="10" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Spending Limit</label>
            <input type="number" value={settings.maxSpendingLimit} onChange={(e) => setSettings({...settings, maxSpendingLimit: e.target.value})} min="1000" step="1000" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Spending Limit</label>
            <input type="number" value={settings.minSpendingLimit} onChange={(e) => setSettings({...settings, minSpendingLimit: e.target.value})} min="10" step="10" className="input-field" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Management</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={settings.allowUserRegistration} onChange={(e) => setSettings({...settings, allowUserRegistration: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="text-gray-700">Allow user registration</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={settings.requireApproval} onChange={(e) => setSettings({...settings, requireApproval: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="text-gray-700">Require admin approval for new accounts</span>
          </label>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <button onClick={handleSave} className="btn-primary">
          Save Settings
        </button>
      </motion.div>
    </div>
  );
}
