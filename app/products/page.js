'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/ui/PublicLayout';
import { CreditCardIcon, GiftIcon, BuildingOfficeIcon, ChartBarIcon, ShieldCheckIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: 'easeOut' } });

const PRODUCTS = [
  {
    icon: CreditCardIcon, color: 'from-blue-500 to-cyan-500',
    title: 'Virtual Cards',
    desc: 'Generate secure 16-digit virtual cards with customisable spending limits, real-time freeze/unfreeze controls, and 3-year validity.',
    features: ['16-digit unique card numbers', 'Instant activation & loading', 'Freeze / unfreeze anytime', 'CVV & PIN protected', '3-year validity period'],
  },
  {
    icon: GiftIcon, color: 'from-pink-500 to-rose-500',
    title: 'Digital Gifting',
    desc: 'Send personalised gift vouchers with scheduled delivery, custom messages, and brand marketplace integration.',
    features: ['Brand marketplace', 'Scheduled delivery', 'Personalised messages', 'Bulk gifting support', 'Instant redemption'],
  },
  {
    icon: BuildingOfficeIcon, color: 'from-violet-500 to-purple-600',
    title: 'Corporate Rewards',
    desc: 'Manage employee benefits, allowances, and corporate reward programs with comprehensive analytics and bulk operations.',
    features: ['Employee onboarding', 'Bulk wallet credits', 'Allowance management', 'Corporate reporting', 'Multi-role access'],
  },
  {
    icon: BanknotesIcon, color: 'from-emerald-500 to-green-600',
    title: 'T+1 Settlement',
    desc: 'Initiate bank settlements with next working day credit directly to your verified bank account.',
    features: ['Minimum ₹10,000 settlement', 'Next working day credit', 'KYC-verified accounts', 'NEFT / RTGS / IMPS', 'Real-time status tracking'],
  },
  {
    icon: ChartBarIcon, color: 'from-orange-500 to-amber-500',
    title: 'Analytics Dashboard',
    desc: 'Real-time insights, transaction monitoring, revenue tracking, and exportable CSV reports for complete visibility.',
    features: ['Live transaction feed', 'Revenue analytics', 'User behaviour insights', 'CSV export', 'Date-range filtering'],
  },
  {
    icon: ShieldCheckIcon, color: 'from-indigo-500 to-blue-600',
    title: 'Enterprise Security',
    desc: 'Bank-grade security with JWT authentication, bcrypt password hashing, KYC verification, and role-based access control.',
    features: ['JWT HTTP-only cookies', 'bcrypt password hashing', 'KYC document verification', 'Role-based access control', '256-bit SSL encryption'],
  },
];

export default function ProductsPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=products').then(r => r.json()).then(d => setPageData(d.page));
  }, []);

  if (pageData?.content) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{pageData.title}</h1>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <motion.div {...fade(0)} className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Our Products</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">Comprehensive Solutions for Modern Businesses</h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Everything you need to manage virtual cards, distribute rewards, and settle payments — in one secure platform.
          </p>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {PRODUCTS.map(({ icon: Icon, color, title, desc, features }, i) => (
            <motion.div key={title} {...fade(i * 0.08)}
              className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
              <ul className="space-y-2">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div {...fade(0.3)} className="mt-16 rounded-3xl p-10 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1d4ed8 100%)' }}>
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-indigo-200 mb-6 text-sm">Create your account and start managing rewards in minutes.</p>
          <a href="/register" className="inline-flex items-center gap-2 px-7 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-sm">
            Create Free Account →
          </a>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
