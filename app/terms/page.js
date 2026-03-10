'use client';

import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/pages?slug=terms')
      .then(res => res.json())
      .then(data => setPageData(data.page));
  }, []);

  if (pageData?.content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
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
          <div className="inline-block p-3 bg-gray-100 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: March 2025</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {[
            { title: '1. Acceptance of Terms', content: 'By accessing and using PPR Smart System, you accept and agree to be bound by the terms and provision of this agreement.' },
            { title: '2. Use License', content: 'Permission is granted to temporarily use PPR Smart System for personal, non-commercial transitory viewing only.' },
            { title: '3. User Accounts', content: 'Users are responsible for maintaining the confidentiality of their account credentials and for all activities under their account.' },
            { title: '4. Virtual Cards', content: 'Virtual cards issued through our platform are subject to spending limits and validity periods. Users must comply with all applicable regulations.' },
            { title: '5. Prohibited Activities', list: ['Fraudulent transactions', 'Unauthorized access to accounts', 'Misuse of virtual cards', 'Violation of applicable laws'] },
            { title: '6. Limitation of Liability', content: 'PPR Smart System shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.' },
            { title: '7. Changes to Terms', content: 'We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.' },
          ].map((section, i) => (
            <section key={i} className="border-l-4 border-indigo-500 pl-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
              {section.content && <p className="text-gray-700 leading-relaxed">{section.content}</p>}
              {section.list && (
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {section.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
