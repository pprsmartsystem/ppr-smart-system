'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CreditCardIcon, 
  GiftIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CreditCardIcon,
    title: 'Virtual Cards',
    description: 'Issue and manage virtual cards with spending limits and real-time controls.',
  },
  {
    icon: GiftIcon,
    title: 'Digital Gifting',
    description: 'Send personalized gift vouchers and rewards to employees and customers.',
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Corporate Management',
    description: 'Streamline employee benefits and corporate reward programs.',
  },
  {
    icon: UserGroupIcon,
    title: 'Multi-Role Access',
    description: 'Role-based dashboards for admins, corporates, employees, and users.',
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics & Reports',
    description: 'Comprehensive insights and exportable transaction reports.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-grade security with JWT authentication and encrypted data.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                PPR Smart System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-violet-600 to-royal-600 bg-clip-text text-transparent">
                Digital Gifting
              </span>
              <br />
              <span className="text-gray-900">Reimagined</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The most advanced platform for corporate rewards, virtual card management, 
              and digital gifting. Built for modern businesses that value efficiency and employee satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent"> corporate rewards</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From virtual cards to gift vouchers, we&apos;ve got your digital reward needs covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="stats-card group hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to transform your rewards program?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of companies already using PPR Smart System to delight their employees.
            </p>
            <Link href="/register" className="inline-flex items-center bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
              Get Started Today
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">PPR Smart System</span>
          </div>
          <p className="text-gray-400 mb-8">
            The future of digital gifting and corporate rewards.
          </p>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500">
              © 2024 PPR Smart System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}