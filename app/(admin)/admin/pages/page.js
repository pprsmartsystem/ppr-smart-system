'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/AdminComponents';

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
    <div className="space-y-5">
      <PageHeader icon={DocumentTextIcon} title="Manage Pages" subtitle="Edit website pages content" color="from-slate-500 to-gray-600" />

      {!selectedPage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pagesList.map((page) => {
            const existingPage = pages.find(p => p.slug === page.slug);
            return (
              <div key={page.slug} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={() => handleEdit(existingPage || { slug: page.slug, title: page.name, content: '' })}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><DocumentTextIcon className="w-5 h-5 text-indigo-600" /></div>
                  <div><p className="font-semibold text-gray-900">{page.name}</p><p className="text-xs text-gray-400">{existingPage ? 'Published' : 'Not configured'}</p></div>
                </div>
                <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700">Edit</button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <button onClick={() => setSelectedPage(null)} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold mb-5">
            ← Back to Pages
          </button>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Page Title</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Content (HTML supported)</label><textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="input-field font-mono text-sm" rows="15" /></div>
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
