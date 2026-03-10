'use client';

import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=about')
      .then(res => res.json())
      .then(data => setPageData(data.page));
  }, []);

  if (pageData?.content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-8 text-center">{pageData.title}</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8" dangerouslySetInnerHTML={{ __html: pageData.content }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Transforming the way businesses manage rewards and employee benefits</p>
        </div>

        {/* Image Banner */}
        <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop" 
            alt="Team collaboration" 
            className="w-full h-80 object-cover"
          />
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed">
              PPR Smart System is a comprehensive digital gifting, corporate rewards, and virtual card management platform built for modern businesses. We provide innovative solutions for employee benefits, gift vouchers, and seamless financial transactions.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize the way businesses manage rewards, gifting, and employee benefits through cutting-edge technology and user-friendly solutions that drive engagement and satisfaction.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💳', title: 'Virtual Card Management', desc: 'Secure digital cards with spending controls' },
              { icon: '🎁', title: 'Digital Gifting Platform', desc: 'Personalized rewards and vouchers' },
              { icon: '🏢', title: 'Corporate Rewards', desc: 'Employee benefits made simple' },
              { icon: '👥', title: 'Employee Management', desc: 'Streamlined onboarding and tracking' },
              { icon: '🔒', title: 'Secure Processing', desc: 'Bank-grade security standards' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time insights and reports' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { num: '10K+', label: 'Active Users' },
            { num: '500+', label: 'Companies' },
            { num: '₹50Cr+', label: 'Transactions' },
            { num: '99.9%', label: 'Uptime' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.num}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
