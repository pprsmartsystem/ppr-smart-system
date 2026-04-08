'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/ui/PublicLayout';
import { EnvelopeIcon, PhoneIcon, ClockIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: 'easeOut' } });

export default function ContactPage() {
  const [pageData, setPageData] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages?slug=contact').then(r => r.json()).then(d => setPageData(d.page));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

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
        <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <motion.div {...fade(0)} className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Contact Us</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">We&apos;d Love to Hear From You</h1>
          <p className="text-indigo-200 text-lg">Our team is here to help. Reach out and we&apos;ll respond within 24 hours.</p>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-5 gap-8">

          {/* Contact Info */}
          <motion.div {...fade(0.05)} className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-5">Get In Touch</h3>
              <div className="space-y-4">
                {[
                  { icon: EnvelopeIcon, label: 'Email', value: 'contact@pprsmartsystem.com', href: 'mailto:contact@pprsmartsystem.com', color: 'bg-indigo-50 text-indigo-600' },
                  { icon: PhoneIcon, label: 'Phone', value: '+91 9403893296', href: 'tel:+919403893296', color: 'bg-green-50 text-green-600' },
                  { icon: ClockIcon, label: 'Business Hours', value: 'Mon–Fri, 9 AM – 6 PM IST', color: 'bg-amber-50 text-amber-600' },
                  { icon: MapPinIcon, label: 'Location', value: 'India', color: 'bg-pink-50 text-pink-600' },
                ].map(({ icon: Icon, label, value, href, color }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      {href
                        ? <a href={href} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors">{value}</a>
                        : <p className="text-sm font-semibold text-gray-800">{value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <h4 className="font-bold mb-2">Quick Support</h4>
              <p className="text-indigo-200 text-sm mb-4">For urgent issues, raise a support ticket directly from your dashboard.</p>
              <a href="/login" className="inline-block text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors">
                Go to Dashboard →
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div {...fade(0.1)} className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Send Us a Message</h3>
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Message Sent!</p>
                  <p className="text-sm text-gray-500">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name" required className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com" required className="input-field text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
                    <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help?" required className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your query in detail..." rows={5} required className="input-field text-sm resize-none" />
                  </div>
                  <button type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm transition-all shadow-sm">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
