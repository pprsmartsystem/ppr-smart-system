'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminPagesPage() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const res = await fetch('/api/admin/pages');
    if (res.ok) {
      const data = await res.json();
      setPages(data.pages || []);
    }
  };

  const handleEdit = (page) => {
    setSelectedPage(page.slug);
    setFormData({ title: page.title, content: page.content });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedPage, ...formData }),
      });

      if (res.ok) {
        toast.success('Page updated successfully!');
        fetchPages();
        setSelectedPage(null);
      } else {
        toast.error('Failed to update page');
      }
    } catch (error) {
      toast.error('Error updating page');
    }
  };

  const pagesList = [
    { slug: 'about', name: 'About Us' },
    { slug: 'contact', name: 'Contact Us' },
    { slug: 'products', name: 'Products' },
    { slug: 'terms', name: 'Terms & Conditions' },
    { slug: 'privacy', name: 'Privacy Policy' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Manage Pages</h1>
        <p className="text-gray-600 mt-2">Edit website pages content</p>
      </motion.div>

      {!selectedPage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pagesList.map((page) => {
            const existingPage = pages.find(p => p.slug === page.slug);
            return (
              <div key={page.slug} className="stats-card hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleEdit(existingPage || { slug: page.slug, title: page.name, content: '' })}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{page.name}</h3>
                      <p className="text-sm text-gray-500">{existingPage ? 'Published' : 'Not configured'}</p>
                    </div>
                  </div>
                  <button className="btn-primary">Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="stats-card">
          <div className="mb-6">
            <button onClick={() => setSelectedPage(null)} className="text-indigo-600 hover:text-indigo-700 font-medium">
              ← Back to Pages
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content (HTML supported)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-field"
                rows="15"
              />
            </div>
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
