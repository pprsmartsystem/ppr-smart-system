'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  EyeIcon, EyeSlashIcon, SparklesIcon, ArrowRightIcon, ArrowLeftIcon,
  ShieldCheckIcon, UserIcon, BuildingOfficeIcon, UserGroupIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ROLES = [
  { id: 'user',      name: 'Individual User',  desc: 'Personal wallet, virtual cards & gift vouchers', icon: UserIcon,           color: 'from-blue-500 to-cyan-500' },
  { id: 'employee',  name: 'Employee',          desc: 'Access corporate benefits and allowances',       icon: UserGroupIcon,      color: 'from-emerald-500 to-green-600' },
  { id: 'corporate', name: 'Corporate Admin',   desc: 'Manage employees and corporate rewards',         icon: BuildingOfficeIcon, color: 'from-violet-500 to-purple-600' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '', companyName: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setDone(true); toast.success('Account created! Awaiting admin approval.'); }
      else toast.error(data.message || 'Registration failed');
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h1>
        <p className="text-gray-500 text-sm mb-8">Your account is pending admin approval. You'll be notified once approved.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all">
          Go to Login <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg">PPR Smart System</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Join thousands of<br />businesses & users</h2>
            <p className="text-indigo-300 text-sm leading-relaxed mb-8">Create your account and start managing digital rewards, virtual cards, and corporate benefits today.</p>
            <div className="space-y-3">
              {['Free to register', 'Admin approval within 24h', 'Secure & encrypted', 'Multi-role support'].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-indigo-200 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-indigo-400 text-xs">© {new Date().getFullYear()} PPR Smart System.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-lg py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">PPR Smart System</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${s <= step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Choose your role</h1>
                  <p className="text-gray-500 text-sm">Select the type of account you want to create</p>
                </div>
                <div className="space-y-3">
                  {ROLES.map(role => (
                    <button key={role.id} onClick={() => { set('role', role.id); setStep(2); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group text-left">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <role.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{role.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-8">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
                    <p className="text-gray-500 text-sm">{ROLES.find(r => r.id === form.role)?.name} account</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="Your full name" required className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="you@example.com" required className="input-field" />
                    </div>
                  </div>

                  {form.role === 'corporate' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                      <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
                        placeholder="Your company name" required className="input-field" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} value={form.password}
                          onChange={e => set('password', e.target.value)}
                          placeholder="Min. 6 characters" required className="input-field pr-11" />
                        <button type="button" onClick={() => setShowPw(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input type={showCpw ? 'text' : 'password'} value={form.confirmPassword}
                          onChange={e => set('confirmPassword', e.target.value)}
                          placeholder="Repeat password" required className="input-field pr-11" />
                        <button type="button" onClick={() => setShowCpw(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showCpw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all shadow-sm disabled:opacity-60 mt-2">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><ShieldCheckIcon className="w-4 h-4" /> Create Account</>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
