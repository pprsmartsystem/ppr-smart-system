'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComputerDesktopIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'software',
    deliveryType: 'manual',
    features: '',
    stock: -1,
    isActive: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        features: formData.features.split('\n').filter(f => f.trim()),
      };

      const res = await fetch('/api/admin/services', {
        method: editService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editService ? { ...payload, id: editService._id } : payload),
      });

      if (res.ok) {
        toast.success(editService ? 'Service updated!' : 'Service created!');
        setShowModal(false);
        resetForm();
        fetchServices();
      }
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      category: service.category,
      deliveryType: service.deliveryType,
      features: service.features?.join('\n') || '',
      stock: service.stock,
      isActive: service.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Service deleted');
        fetchServices();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'software',
      deliveryType: 'manual',
      features: '',
      stock: -1,
      isActive: true,
    });
    setEditService(null);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Services Management</h1>
          <p className="text-gray-600 mt-2">Manage your digital services and software products</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Service
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Service Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Delivery</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.description?.substring(0, 50)}...</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(service.price)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600 capitalize">{service.deliveryType}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{service.stock === -1 ? 'Unlimited' : service.stock}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => handleEdit(service)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(service._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No services found</p>
          </div>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editService ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field">
                    <option value="software">Software</option>
                    <option value="api">API Service</option>
                    <option value="hosting">Hosting</option>
                    <option value="license">License</option>
                    <option value="subscription">Subscription</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                  <select value={formData.deliveryType} onChange={(e) => setFormData({...formData, deliveryType: e.target.value})} className="input-field">
                    <option value="instant">Instant</option>
                    <option value="manual">Manual</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock (-1 = Unlimited)</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field" rows="3" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                  <textarea value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="input-field" rows="4" placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editService ? 'Update' : 'Create'} Service</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
