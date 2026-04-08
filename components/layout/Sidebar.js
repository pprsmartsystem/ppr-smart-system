'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HomeIcon, CreditCardIcon, GiftIcon, UserGroupIcon, ChartBarIcon,
  CogIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, SparklesIcon,
  WalletIcon, BuildingOfficeIcon, ShieldCheckIcon, DocumentChartBarIcon,
  DocumentCheckIcon, BellIcon, ChatBubbleLeftRightIcon, MegaphoneIcon,
  ComputerDesktopIcon, ShoppingBagIcon, DocumentTextIcon, TruckIcon,
  CurrencyDollarIcon, ClipboardDocumentListIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';

const NAV = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Distributors', href: '/admin/distributors', icon: UserGroupIcon },
    { name: 'Wallet', href: '/admin/wallet', icon: WalletIcon },
    { name: 'Corporates', href: '/admin/corporates', icon: BuildingOfficeIcon },
    { name: 'Cards', href: '/admin/cards', icon: CreditCardIcon },
    { name: 'KYC', href: '/admin/kyc', icon: DocumentCheckIcon },
    { name: 'Spend/Redeem Settlement', href: '/admin/settlement', icon: BellIcon },
    { name: 'Initiate/T+1 Settlement', href: '/admin/user-settlements', icon: CurrencyDollarIcon },
    { name: 'Cashback', href: '/admin/cashback', icon: GiftIcon },
    { name: 'Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
    { name: 'Broadcast', href: '/admin/broadcast', icon: MegaphoneIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'Transactions', href: '/admin/transactions', icon: DocumentChartBarIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Pages', href: '/admin/pages', icon: DocumentCheckIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
    { divider: true },
    { name: 'IT Services', href: '/admin/services', icon: ComputerDesktopIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Invoices', href: '/admin/invoices', icon: DocumentTextIcon },
    { name: 'Delivery Proof', href: '/admin/delivery', icon: TruckIcon },
    { name: 'Payment Logs', href: '/admin/payment-logs', icon: CurrencyDollarIcon },
    { name: 'Service Reports', href: '/admin/service-reports', icon: ClipboardDocumentListIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardDocumentListIcon },
  ],
  distributor: [
    { name: 'Dashboard', href: '/distributor', icon: HomeIcon },
    { name: 'Users', href: '/distributor/users', icon: UserGroupIcon },
    { name: 'Wallet', href: '/distributor/wallet', icon: WalletIcon },
    { name: 'Recharge', href: '/distributor/recharge', icon: CreditCardIcon },
    { name: 'Reports', href: '/distributor/reports', icon: DocumentChartBarIcon },
    { name: 'Support', href: '/distributor/support', icon: ChatBubbleLeftRightIcon },
    { name: 'Settings', href: '/distributor/settings', icon: CogIcon },
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
    { name: 'Settlement', href: '/user/settlement', icon: BanknotesIcon },
    { name: 'KYC', href: '/user/kyc', icon: DocumentCheckIcon },
    { name: 'Gift Vouchers', href: '/user/vouchers', icon: GiftIcon },
    { name: 'Transactions', href: '/user/transactions', icon: DocumentChartBarIcon },
    { name: 'Support', href: '/user/support', icon: ChatBubbleLeftRightIcon },
    { name: 'Settings', href: '/user/settings', icon: CogIcon },
  ],
};

const BOTTOM_NAV = [
  { name: 'Home',   href: '/user',            icon: HomeIcon },
  { name: 'Wallet', href: '/user/wallet',      icon: WalletIcon },
  { name: 'Cards',  href: '/user/cards',       icon: CreditCardIcon },
  { name: 'Settle', href: '/user/settlement',  icon: BanknotesIcon },
  { name: 'More',   href: null,                icon: Bars3Icon },
];

export default function Sidebar({ userRole, userName, userEmail }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const nav = NAV[userRole] || [];
  const isUser = userRole === 'user';

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  }, [router]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const NavContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">PPR Smart</p>
            <p className="text-xs text-gray-400 capitalize">{userRole} Panel</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {nav.map((item, i) => {
          if (item.divider) return (
            <div key={i} className="py-3">
              {(!collapsed || mobile) ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">IT Services</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              ) : <div className="h-px bg-gray-100" />}
            </div>
          );
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              onClick={mobile ? closeDrawer : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
              {(!collapsed || mobile) && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        {(!collapsed || mobile) && (
          <div className="mb-2 px-3 py-2 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar (user only) ── */}
      {isUser && (
        <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">PPR Smart</span>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* ── Mobile hamburger (non-user roles) ── */}
      {!isUser && (
        <button onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-100">
          <Bars3Icon className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40"
              onClick={closeDrawer}
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="lg:hidden fixed left-0 top-0 z-50 w-72 h-full bg-white shadow-2xl"
            >
              <button onClick={closeDrawer}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>
              <NavContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen bg-white border-r border-gray-100 relative flex-shrink-0 overflow-hidden"
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}
            className="text-gray-500 text-xs font-bold">›</motion.span>
        </button>
        <NavContent />
      </motion.aside>

      {/* ── Mobile bottom nav (user only) ── */}
      {isUser && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
          <div className="flex items-center justify-around px-1 py-1">
            {BOTTOM_NAV.map(({ name, href, icon: Icon }) => {
              const active = href && pathname === href;
              return (
                <button key={name}
                  onClick={() => href ? router.push(href) : setDrawerOpen(true)}
                  className="flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-0"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${active ? 'bg-indigo-600' : ''}`}>
                    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
