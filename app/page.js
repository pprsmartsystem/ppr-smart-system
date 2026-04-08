'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CreditCardIcon, GiftIcon, BuildingOfficeIcon, UserGroupIcon,
  ChartBarIcon, ShieldCheckIcon, ArrowRightIcon, SparklesIcon,
  BanknotesIcon, CheckCircleIcon, Bars3Icon, XMarkIcon,
  BoltIcon, GlobeAltIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: 'easeOut' },
});

const FEATURES = [
  { icon: CreditCardIcon, title: 'Virtual Cards', desc: 'Issue 16-digit virtual cards with spending limits, freeze/unfreeze, and 3-year validity.', color: 'from-blue-500 to-cyan-500' },
  { icon: GiftIcon, title: 'Digital Gifting', desc: 'Send personalised gift vouchers and rewards to employees and customers instantly.', color: 'from-pink-500 to-rose-500' },
  { icon: BuildingOfficeIcon, title: 'Corporate Management', desc: 'Streamline employee benefits, bulk allowances, and corporate reward programs.', color: 'from-violet-500 to-purple-600' },
  { icon: BanknotesIcon, title: 'T+1 Settlement', desc: 'Initiate bank settlements with next working day credit directly to your account.', color: 'from-emerald-500 to-green-600' },
  { icon: ChartBarIcon, title: 'Analytics & Reports', desc: 'Real-time dashboards, transaction monitoring, and exportable CSV reports.', color: 'from-orange-500 to-amber-500' },
  { icon: ShieldCheckIcon, title: 'Enterprise Security', desc: 'JWT auth, bcrypt hashing, role-based access control, and KYC verification.', color: 'from-indigo-500 to-blue-600' },
];

const STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '₹50Cr+', label: 'Transactions Processed' },
  { value: '500+', label: 'Corporate Clients' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const ROLES = [
  { role: 'Corporate', desc: 'Employee management, bulk credits, reports', color: 'bg-purple-50 border-purple-200 text-purple-700', dot: 'bg-purple-400' },
  { role: 'Distributor', desc: 'User management, wallet recharge, reports', color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-400' },
  { role: 'Employee', desc: 'Corporate benefits, allowances, vouchers', color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-400' },
  { role: 'User', desc: 'Personal wallet, virtual cards, settlements', color: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-400' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">PPR Smart</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[['#features', 'Features'], ['#roles', 'Roles'], ['#stats', 'About']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors px-4 py-2">Sign In</Link>
            <Link href="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMenuOpen(m => !m)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
            {menuOpen ? <XMarkIcon className="w-5 h-5 text-gray-700" /> : <Bars3Icon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white border-b border-gray-100 px-4 pb-4 space-y-1">
            {[['#features', 'Features'], ['#roles', 'Roles'], ['#stats', 'About']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600">{label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700">Sign In</Link>
              <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl">Get Started</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fade(0)}>
            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <BoltIcon className="w-3.5 h-3.5" /> India&apos;s Leading Digital Rewards Platform
            </span>
          </motion.div>

          <motion.h1 {...fade(0.08)} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Corporate Rewards &<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Virtual Cards
            </span>
            <br />Reimagined
          </motion.h1>

          <motion.p {...fade(0.16)} className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The most advanced platform for managing virtual cards, distributing allowances, settling payments, and rewarding employees — all in one secure dashboard.
          </motion.p>

          <motion.div {...fade(0.22)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-200 text-base">
              Start for Free <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-gray-800 font-semibold rounded-2xl transition-all text-base">
              Sign In to Dashboard
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div {...fade(0.3)} className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {[
              [ShieldCheckIcon, '256-bit SSL'],
              [LockClosedIcon, 'KYC Verified'],
              [GlobeAltIcon, 'PCI Compliant'],
            ].map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <Icon className="w-3.5 h-3.5 text-green-500" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero card preview */}
        <motion.div {...fade(0.35)} className="max-w-5xl mx-auto mt-16 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

            {/* Shiny Virtual Cards Stack */}
            <div className="relative h-72 flex items-center justify-center">
              {/* Card 3 - back */}
              <div className="absolute" style={{ transform: 'rotate(-8deg) translateY(16px) translateX(24px)', zIndex: 1 }}>
                <div className="w-72 h-44 rounded-2xl p-5 relative overflow-hidden shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)' }}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)' }} />
                </div>
              </div>
              {/* Card 2 - middle */}
              <div className="absolute" style={{ transform: 'rotate(-3deg) translateY(8px) translateX(10px)', zIndex: 2 }}>
                <div className="w-72 h-44 rounded-2xl p-5 relative overflow-hidden shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)' }}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.6) 0%, transparent 60%)' }} />
                </div>
              </div>
              {/* Card 1 - front (main) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative" style={{ zIndex: 3 }}>
                <div className="w-72 h-44 rounded-2xl p-5 relative overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)' }}>
                  {/* Shine sweep */}
                  <motion.div
                    animate={{ x: [-200, 350] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    className="absolute top-0 left-0 w-20 h-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transform: 'skewX(-20deg)' }}
                  />
                  {/* Glow blob */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
                  {/* Chip */}
                  <div className="w-9 h-7 rounded-md mb-4 shadow-inner"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #f5d76e, #d4af37)' }} />
                  {/* Card number */}
                  <div className="flex gap-3 mb-3">
                    {['••••', '••••', '••••', '4521'].map((g, i) => (
                      <span key={i} className="text-white font-mono text-sm tracking-widest opacity-90">{g}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-indigo-300 text-xs mb-0.5">CARD HOLDER</p>
                      <p className="text-white text-xs font-semibold tracking-wide">PPR SMART USER</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-300 text-xs mb-0.5">EXPIRES</p>
                      <p className="text-white text-xs font-semibold">12/27</p>
                    </div>
                  </div>
                  {/* Network circles */}
                  <div className="absolute top-4 right-4 flex">
                    <div className="w-6 h-6 rounded-full opacity-90" style={{ background: '#eb001b' }} />
                    <div className="w-6 h-6 rounded-full opacity-90 -ml-2" style={{ background: '#f79e1b' }} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Dashboard preview */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100 border border-gray-100">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      <SparklesIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-xs">PPR Smart Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-300 text-xs font-medium">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['Wallet', '₹4,500', 'text-white'], ['Cards', '3', 'text-blue-300'], ['Pending', '₹10K', 'text-amber-300']].map(([label, val, color]) => (
                    <div key={label} className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                      <p className="text-white/40 text-xs mb-0.5">{label}</p>
                      <p className={`font-bold text-sm ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[
                    ['Settlement Initiated', '₹10,000', 'text-green-400', 'bg-green-500/10'],
                    ['Card Created', '•••• 4521', 'text-blue-400', 'bg-blue-500/10'],
                    ['Wallet Credited', '+₹5,000', 'text-emerald-400', 'bg-emerald-500/10'],
                  ].map(([desc, val, color, bg]) => (
                    <div key={desc} className={`flex items-center justify-between ${bg} rounded-xl px-3 py-2`}>
                      <span className="text-white/60 text-xs">{desc}</span>
                      <span className={`text-xs font-bold ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label} {...fade(i * 0.08)} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{value}</p>
              <p className="text-indigo-200 text-sm font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fade(0)} className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
              Everything your business needs
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From virtual cards to corporate settlements — one platform, complete control.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} {...fade(i * 0.07)}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade(0)} className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Multi-Role Platform</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Built for every stakeholder</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Dedicated dashboards and permissions for every role in your organisation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(({ role, desc, color, dot }, i) => (
              <motion.div key={role} {...fade(i * 0.07)}
                className={`rounded-2xl border p-5 ${color} hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  <span className="font-bold text-sm">{role}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade(0)} className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Up and running in minutes</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Create your account', desc: 'Register as a user, corporate, or distributor. Admin approves your account within 24 hours.' },
              { step: '02', title: 'Complete KYC', desc: 'Upload your Aadhaar, PAN, and bank details. Get verified to unlock all features including settlements.' },
              { step: '03', title: 'Add wallet balance', desc: 'Use UPI, QR code, or payment link to top up your wallet. Submit UTR for instant verification.' },
              { step: '04', title: 'Issue cards & settle', desc: 'Create virtual cards, distribute allowances, and initiate T+1 bank settlements seamlessly.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div key={step} {...fade(i * 0.08)}
                className="flex gap-5 bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade(0)}
            className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1d4ed8 100%)' }}>
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
            <div className="relative z-10">
              <SparklesIcon className="w-10 h-10 text-indigo-300 mx-auto mb-5" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to transform your rewards program?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of companies already using PPR Smart System to delight their employees and streamline payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg">
                  Get Started Free <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-colors">
                  Sign In
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                {['No credit card required', 'Admin approval within 24h', 'Cancel anytime'].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-indigo-200">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">PPR Smart System</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The future of digital gifting, corporate rewards, and virtual card management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2.5">
                {[['About Us', '/about'], ['Products', '/products'], ['Contact', '/contact']].map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2.5">
                {[['Terms & Conditions', '/terms'], ['Privacy Policy', '/privacy']].map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Support</h3>
              <ul className="space-y-2.5">
                <li><a href="mailto:contact@pprsmartsystem.com" className="text-gray-400 hover:text-white text-sm transition-colors">contact@pprsmartsystem.com</a></li>
                <li><span className="text-gray-400 text-sm">+91 9403893296</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2024 PPR Smart System. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />
              Secured with 256-bit SSL encryption
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
