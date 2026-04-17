'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/ui/PublicLayout';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: 'easeOut' } });

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: 'We collect information that you provide directly to us when creating an account or using our services:',
    list: ['Name, email address, and contact number', 'Account credentials (stored encrypted)', 'Payment and transaction information', 'KYC documents (Aadhaar, PAN, bank details)', 'Device and usage data'],
  },
  {
    title: 'How We Use Your Information',
    list: ['Process transactions and manage your account', 'Verify identity and prevent fraud', 'Provide customer support and respond to queries', 'Send important account notifications', 'Comply with legal and regulatory requirements', 'Improve our platform and services'],
  },
  {
    title: 'Data Security',
    content: 'We implement industry-standard security measures to protect your personal information, including 256-bit SSL encryption, JWT authentication with HTTP-only cookies, bcrypt password hashing, and regular security audits.',
  },
  {
    title: 'KYC Data Handling',
    content: 'KYC documents submitted for verification are stored securely and used solely for identity verification purposes. Documents are reviewed by authorised personnel only and are not shared with third parties except as required by law.',
  },
  {
    title: 'Information Sharing',
    content: 'We do not sell your personal information. We may share information with trusted service providers who assist in operating our platform, legal authorities when required by law, and corporate affiliates as necessary for business operations.',
  },
  {
    title: 'Your Rights',
    list: ['Access and review your personal data', 'Request correction of inaccurate information', 'Request deletion of your account and data', 'Opt-out of marketing communications', 'Export your transaction data in CSV format'],
  },
  {
    title: 'Cookies & Tracking',
    content: 'We use HTTP-only cookies for secure session management. We do not use third-party tracking cookies. You can control cookie settings through your browser, though disabling cookies may affect platform functionality.',
  },
  {
    title: 'Data Retention',
    content: 'We retain your personal data for as long as your account is active or as needed to provide services. Transaction records are retained for 7 years as required by Indian financial regulations.',
  },
  {
    title: 'Contact for Privacy',
    content: 'For privacy-related questions, data requests, or concerns, contact us at: support@pprsmartsystem.com. We will respond within 30 days.',
  },
];

export default function PrivacyPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=privacy').then(r => r.json()).then(d => setPageData(d.page));
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
      <section className="relative overflow-hidden py-16 px-4 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #065f46 100%)' }}>
        <motion.div {...fade(0)} className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheckIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-emerald-300 text-sm">Last updated: March 2025 · Your privacy is our priority</p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Summary banner */}
        <motion.div {...fade(0.05)} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-10 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 leading-relaxed">
            We are committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights regarding your information.
          </p>
        </motion.div>

        <div className="space-y-6">
          {SECTIONS.map(({ title, content, list }, i) => (
            <motion.div key={title} {...fade(i * 0.04)}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {title}
              </h2>
              {content && <p className="text-gray-500 text-sm leading-relaxed">{content}</p>}
              {list && (
                <ul className="space-y-2 mt-2">
                  {list.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        {/* Security badge */}
        <motion.div {...fade(0.3)} className="mt-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold">Your Privacy is Protected</p>
            <p className="text-emerald-100 text-sm mt-0.5">We use 256-bit SSL encryption and never sell your personal data to third parties.</p>
          </div>
        </motion.div>

        <motion.div {...fade(0.35)} className="mt-6 bg-gray-900 rounded-2xl p-6 text-center text-white">
          <p className="text-sm text-gray-300 mb-3">Have privacy concerns or data requests?</p>
          <a href="/contact" className="inline-block text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Contact our privacy team →
          </a>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
