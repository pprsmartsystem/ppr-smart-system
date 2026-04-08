'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/ui/PublicLayout';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: 'easeOut' } });

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using PPR Smart System, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our platform.' },
  { title: '2. Use License', content: 'Permission is granted to use PPR Smart System for personal and business purposes in accordance with these terms. You may not sublicense, sell, or transfer your account to any third party.' },
  { title: '3. User Accounts', content: 'Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You must notify us immediately of any unauthorised use.' },
  { title: '4. Virtual Cards', content: 'Virtual cards issued through our platform are subject to spending limits and validity periods. Users must comply with all applicable RBI regulations and guidelines regarding prepaid payment instruments.' },
  { title: '5. KYC Requirements', content: 'To access settlement and certain financial features, users must complete KYC verification by submitting valid government-issued identity documents. We reserve the right to reject incomplete or fraudulent submissions.' },
  { title: '6. Settlement Terms', content: 'Settlements follow a T+1 model (next working day). Minimum settlement amount is ₹10,000. Weekends and public holidays are excluded. Amounts are deducted from wallet immediately upon initiation.' },
  { title: '7. Prohibited Activities', list: ['Fraudulent or unauthorised transactions', 'Unauthorised access to other accounts', 'Misuse of virtual cards or wallet balance', 'Violation of applicable Indian laws', 'Money laundering or terrorist financing'] },
  { title: '8. Limitation of Liability', content: 'PPR Smart System shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service, including but not limited to loss of profits or data.' },
  { title: '9. Governing Law', content: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.' },
  { title: '10. Changes to Terms', content: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the service constitutes acceptance of modified terms.' },
];

export default function TermsPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=terms').then(r => r.json()).then(d => setPageData(d.page));
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
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
        <motion.div {...fade(0)} className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <DocumentTextIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Terms & Conditions</h1>
          <p className="text-indigo-300 text-sm">Last updated: March 2025 · Effective immediately</p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Summary banner */}
        <motion.div {...fade(0.05)} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-10 flex items-start gap-3">
          <DocumentTextIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700 leading-relaxed">
            Please read these terms carefully before using PPR Smart System. By creating an account, you agree to be bound by these terms and our Privacy Policy.
          </p>
        </motion.div>

        <div className="space-y-6">
          {SECTIONS.map(({ title, content, list }, i) => (
            <motion.div key={title} {...fade(i * 0.04)}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {title.replace(/^\d+\.\s/, '')}
              </h2>
              {content && <p className="text-gray-500 text-sm leading-relaxed">{content}</p>}
              {list && (
                <ul className="space-y-2 mt-2">
                  {list.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div {...fade(0.3)} className="mt-10 bg-gray-900 rounded-2xl p-6 text-center text-white">
          <p className="text-sm text-gray-300 mb-3">Questions about our terms?</p>
          <a href="/contact" className="inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Contact our legal team →
          </a>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
