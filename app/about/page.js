'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/ui/PublicLayout';
import { BoltIcon, ShieldCheckIcon, ChartBarIcon, UserGroupIcon, CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: 'easeOut' } });

export default function AboutPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=about').then(r => r.json()).then(d => setPageData(d.page));
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
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <motion.div {...fade(0)} className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">About Us</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">Transforming Corporate Rewards in India</h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            PPR Smart System is a comprehensive digital gifting, corporate rewards, and virtual card management platform built for modern Indian businesses.
          </p>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">

        {/* Who we are + Mission */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: BoltIcon, color: 'from-indigo-500 to-purple-600',
              title: 'Who We Are',
              text: 'PPR Smart System is a fintech platform providing innovative solutions for employee benefits, virtual card management, gift vouchers, and seamless financial settlements. We serve corporates, distributors, and individual users across India.',
            },
            {
              icon: ShieldCheckIcon, color: 'from-emerald-500 to-green-600',
              title: 'Our Mission',
              text: 'To revolutionize the way businesses manage rewards, gifting, and employee benefits through cutting-edge technology and user-friendly solutions that drive engagement, satisfaction, and financial efficiency.',
            },
          ].map(({ icon: Icon, color, title, text }, i) => (
            <motion.div key={title} {...fade(i * 0.1)} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-500 leading-relaxed text-sm">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* What we offer */}
        <motion.div {...fade(0.1)}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
            <p className="text-gray-500 mt-2">End-to-end solutions for digital rewards and payments</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: CreditCardIcon, title: 'Virtual Cards', desc: 'Secure digital cards with spending controls', color: 'from-blue-500 to-cyan-500' },
              { icon: GiftIcon, title: 'Digital Gifting', desc: 'Personalised rewards and vouchers', color: 'from-pink-500 to-rose-500' },
              { icon: UserGroupIcon, title: 'Corporate Rewards', desc: 'Employee benefits made simple', color: 'from-violet-500 to-purple-600' },
              { icon: ShieldCheckIcon, title: 'KYC Verification', desc: 'Secure identity verification', color: 'from-emerald-500 to-green-600' },
              { icon: ChartBarIcon, title: 'Analytics', desc: 'Real-time insights and reports', color: 'from-orange-500 to-amber-500' },
              { icon: BoltIcon, title: 'T+1 Settlement', desc: 'Next-day bank settlements', color: 'from-indigo-500 to-blue-600' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} {...fade(i * 0.06)} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fade(0.15)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['10K+', 'Active Users'], ['500+', 'Corporate Clients'], ['₹50Cr+', 'Transactions'], ['99.9%', 'Uptime SLA']].map(([val, label], i) => (
              <div key={label} className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-center text-white">
                <p className="text-3xl font-bold mb-1">{val}</p>
                <p className="text-indigo-200 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </PublicLayout>
  );
}
