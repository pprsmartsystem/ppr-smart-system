'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HomeIcon,
  CreditCardIcon,
  GiftIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  WalletIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  DocumentCheckIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

const navigationItems = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Wallet', href: '/admin/wallet', icon: WalletIcon },
    { name: 'Corporates', href: '/admin/corporates', icon: BuildingOfficeIcon },
    { name: 'Cards', href: '/admin/cards', icon: CreditCardIcon },
    { name: 'KYC', href: '/admin/kyc', icon: DocumentCheckIcon },
    { name: 'Settlement', href: '/admin/settlement', icon: BellIcon },
    { name: 'Cashback', href: '/admin/cashback', icon: GiftIcon },
    { name: 'Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
    { name: 'Broadcast', href: '/admin/broadcast', icon: MegaphoneIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'Transactions', href: '/admin/transactions', icon: DocumentChartBarIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Pages', href: '/admin/pages', icon: DocumentCheckIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ],
  corporate: [
    { name: 'Dashboard', href: '/corporate', icon: HomeIcon },
    { name: 'Employees', href: '/corporate/employees', icon: UserGroupIcon },
    { name: 'Cards', href: '/corporate/cards', icon: CreditCardIcon },
    { name: 'Wallet', href: '/corporate/wallet', icon: WalletIcon },
    { name: 'Reports', href: '/corporate/reports', icon: DocumentChartBarIcon },
    { name: 'Settings', href: '/corporate/settings', icon: CogIcon },
  ],
  employee: [
    { name: 'Dashboard', href: '/employee', icon: HomeIcon },
    { name: 'My Cards', href: '/employee/cards', icon: CreditCardIcon },
    { name: 'Allowance', href: '/employee/allowance', icon: WalletIcon },
    { name: 'Vouchers', href: '/employee/vouchers', icon: GiftIcon },
    { name: 'Transactions', href: '/employee/transactions', icon: DocumentChartBarIcon },
  ],
  user: [
    { name: 'Dashboard', href: '/user', icon: HomeIcon },
    { name: 'Wallet', href: '/user/wallet', icon: WalletIcon },
    { name: 'My Cards', href: '/user/cards', icon: CreditCardIcon },
    { name: 'Gateway', href: '/user/gateway', icon: ShieldCheckIcon },
    { name: 'Settlement', href: '/user/settlement', icon: DocumentChartBarIcon },
    { name: 'KYC', href: '/user/kyc', icon: DocumentCheckIcon },
    { name: 'Gift Vouchers', href: '/user/vouchers', icon: GiftIcon },
    { name: 'Transactions', href: '/user/transactions', icon: DocumentChartBarIcon },
    { name: 'Support', href: '/user/support', icon: ChatBubbleLeftRightIcon },
    { name: 'Settings', href: '/user/settings', icon: CogIcon },
  ],
};

export default function Sidebar({ userRole, userName, userEmail }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigation = navigationItems[userRole] || [];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center flex-shrink-0">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        {(!isCollapsed || isMobile) && (
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">PPR Smart</h1>
            <p className="text-xs text-gray-500 capitalize">{userRole} Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => isMobile && setIsMobileOpen(false)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="ml-3 truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-200 p-4">
        {(!isCollapsed || isMobile) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="ml-3">Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-80 h-full bg-white shadow-xl"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <SidebarContent isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRightOnRectangleIcon className="w-3 h-3 text-gray-600" />
          </motion.div>
        </button>
        <SidebarContent />
      </motion.div>
    </>
  );
}