'use client';

import { useState, useEffect } from 'react';

export default function PrivacyPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=privacy')
      .then(res => res.json())
      .then(data => setPageData(data.page));
  }, []);

  if (pageData?.content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-8 text-center">{pageData.title}</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8" dangerouslySetInnerHTML={{ __html: pageData.content }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: March 2025</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {[
            { 
              title: '1. Information We Collect', 
              content: 'We collect information that you provide directly to us, including:',
              list: ['Name and contact information', 'Account credentials', 'Payment and transaction information', 'KYC documents (Aadhaar, PAN, etc.)', 'Usage data and preferences']
            },
            { 
              title: '2. How We Use Your Information',
              list: ['Process transactions and manage accounts', 'Verify identity and prevent fraud', 'Provide customer support', 'Send important notifications', 'Improve our services']
            },
            { 
              title: '3. Data Security', 
              content: 'We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your personal information.'
            },
            { 
              title: '4. Information Sharing', 
              content: 'We do not sell your personal information. We may share information with service providers, legal authorities when required, and corporate affiliates as necessary for business operations.'
            },
            { 
              title: '5. Your Rights',
              list: ['Access your personal data', 'Request data correction or deletion', 'Opt-out of marketing communications', 'Export your data']
            },
            { 
              title: '6. Cookies', 
              content: 'We use cookies and similar technologies to maintain sessions, analyze usage, and improve user experience.'
            },
            { 
              title: '7. Contact Us', 
              content: 'For privacy-related questions, contact us at: privacy@pprsmart.com'
            },
          ].map((section, i) => (
            <section key={i} className="border-l-4 border-green-500 pl-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
              {section.content && <p className="text-gray-700 leading-relaxed mb-3">{section.content}</p>}
              {section.list && (
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {section.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white mt-8">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <div className="font-bold text-lg">Your Privacy Matters</div>
                <div className="text-sm text-white/90">We are committed to protecting your personal information</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
