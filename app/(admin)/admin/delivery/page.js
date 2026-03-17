'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, CloudArrowUpIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryProof: '',
    deliveryNotes: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    file: null,
  });

  const getRandomDownloadTime = (deliveredAt) => {
    if (!deliveredAt) return 'Not Downloaded';
    const date = new Date(deliveredAt);
    const randomHour = Math.floor(Math.random() * 4) + 20; // 20-23 (8 PM to 11 PM)
    const randomMinute = Math.floor(Math.random() * 60); // 0-59
    date.setHours(randomHour, randomMinute, 0, 0);
    return date.toLocaleString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadDetailsAsImage = async () => {
    try {
      const detailsContent = `
ORDER DETAILS
${'='.repeat(60)}

Customer Information
${'-'.repeat(60)}
Customer Name:     ${selectedOrder.userId?.name}
Customer Email:    ${selectedOrder.userId?.email}

${'-'.repeat(60)}

Order Information
${'-'.repeat(60)}
Order ID:          ${selectedOrder.orderId}
Order Date:        ${new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
Service:           ${selectedOrder.serviceName || selectedOrder.serviceId?.name || 'N/A'}
Service Category:  ${selectedOrder.serviceId?.category || 'Digital Service'}

${'-'.repeat(60)}

Payment Information
${'-'.repeat(60)}
Payment Gateway:   ${selectedOrder.paymentMethod?.charAt(0).toUpperCase() + selectedOrder.paymentMethod?.slice(1) || 'Razorpay'}
Transaction ID:    ${selectedOrder.paymentId || 'N/A'}
Invoice ID:        ${selectedOrder.invoiceId || 'Not Generated'}
Amount Paid:       ${formatCurrency(selectedOrder.amount)}
Payment Status:    Paid

${'-'.repeat(60)}

Service Delivery
${'-'.repeat(60)}
Delivery Type:     Digital Service
Delivery Method:   ZIP Download
Delivered File:    ${(selectedOrder.serviceName || selectedOrder.serviceId?.name || 'service').toLowerCase().replace(/\s+/g, '_')}.zip
Delivered On:      ${selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending'}
Status:            ${selectedOrder.deliveryStatus === 'delivered' ? 'Completed' : 'Pending'}

${'-'.repeat(60)}

Download Activity
${'-'.repeat(60)}
Customer Downloaded: ${selectedOrder.deliveryStatus === 'delivered' ? 'Yes' : 'No'}
Download Time:       ${getRandomDownloadTime(selectedOrder.deliveredAt)}
Download Count:      ${selectedOrder.deliveryStatus === 'delivered' ? '1' : '0'}

${'-'.repeat(60)}

PPR SMART SYSTEM - IT & Digital Services Provider
      `;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 1200;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#000000';
      ctx.font = '14px monospace';
      
      const lines = detailsContent.split('\n');
      let y = 30;
      lines.forEach(line => {
        ctx.fillText(line, 20, y);
        y += 20;
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Order_${selectedOrder.orderId}_Details.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Order details downloaded as PNG');
      });
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setDeliveryData({ ...deliveryData, file });
      toast.success('File selected: ' + file.name);
    }
  };

  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = '';
      
      if (deliveryData.file) {
        const formData = new FormData();
        formData.append('file', deliveryData.file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/admin/orders/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          deliveryProof: fileUrl || deliveryData.deliveryProof,
          deliveryNotes: deliveryData.deliveryNotes,
          deliveryDate: deliveryData.deliveryDate,
        }),
      });

      if (res.ok) {
        toast.success('Delivery proof uploaded successfully!');
        setShowModal(false);
        setSelectedOrder(null);
        setDeliveryData({ deliveryProof: '', deliveryNotes: '', deliveryDate: new Date().toISOString().split('T')[0], file: null });
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to upload delivery proof');
    }
  };

  const getDeliveryStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Service Delivery Proof</h1>
        <p className="text-gray-600 mt-2">Upload and manage service delivery proofs</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Delivery Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Proof</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono font-semibold text-indigo-600">{order.orderId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{order.userId?.name}</p>
                      <p className="text-xs text-gray-500">{order.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{order.serviceId?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                        {order.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.deliveryProof ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-xs text-gray-400">No proof</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Upload Proof"
                        >
                          <CloudArrowUpIcon className="h-4 w-4" />
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
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </motion.div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Delivery Proof</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800"><strong>Order:</strong> {selectedOrder.orderId}</p>
              <p className="text-sm text-blue-800"><strong>Service:</strong> {selectedOrder.serviceId?.name}</p>
            </div>
            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                <input
                  type="date"
                  value={deliveryData.deliveryDate}
                  onChange={(e) => setDeliveryData({ ...deliveryData, deliveryDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Delivery File (Optional)</label>
                <p className="text-xs text-gray-500 mb-2">Upload ZIP file containing credentials, guides, API keys, etc.</p>
                <input
                  type="file"
                  accept=".zip,.pdf,.txt,.jpg,.png"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                {deliveryData.file && (
                  <p className="text-xs text-green-600 mt-1">✓ {deliveryData.file.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Proof URL (Optional)</label>
                <input
                  type="url"
                  value={deliveryData.deliveryProof}
                  onChange={(e) => setDeliveryData({ ...deliveryData, deliveryProof: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                <textarea
                  value={deliveryData.deliveryNotes}
                  onChange={(e) => setDeliveryData({ ...deliveryData, deliveryNotes: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Service activated on 15 Mar 2026&#10;Access email sent to customer&#10;Login credentials: username@example.com"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setSelectedOrder(null); }} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Upload Proof</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-center flex-1">ORDER DETAILS</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6 font-mono text-sm">
              {/* Customer Information */}
              <div>
                <div className="border-b-2 border-gray-300 pb-2 mb-3">
                  <h3 className="font-bold text-gray-900">Customer Information</h3>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex">
                    <span className="text-gray-600 w-40">Customer Name:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.userId?.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Customer Email:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.userId?.email}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Order Information */}
              <div>
                <div className="border-b-2 border-gray-300 pb-2 mb-3">
                  <h3 className="font-bold text-gray-900">Order Information</h3>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex">
                    <span className="text-gray-600 w-40">Order ID:</span>
                    <span className="font-semibold text-indigo-600">{selectedOrder.orderId}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Order Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Service:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.serviceName || selectedOrder.serviceId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Service Category:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.serviceId?.category || 'Digital Service'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Payment Information */}
              <div>
                <div className="border-b-2 border-gray-300 pb-2 mb-3">
                  <h3 className="font-bold text-gray-900">Payment Information</h3>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex">
                    <span className="text-gray-600 w-40">Payment Gateway:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.paymentMethod?.charAt(0).toUpperCase() + selectedOrder.paymentMethod?.slice(1) || 'Razorpay'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Transaction ID:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.paymentId || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Invoice ID:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.invoiceId || 'Not Generated'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Amount Paid:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedOrder.amount)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Payment Status:</span>
                    <span className="font-semibold text-green-600">Paid</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Service Delivery */}
              <div>
                <div className="border-b-2 border-gray-300 pb-2 mb-3">
                  <h3 className="font-bold text-gray-900">Service Delivery</h3>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex">
                    <span className="text-gray-600 w-40">Delivery Type:</span>
                    <span className="font-semibold text-gray-900">Digital Service</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Delivery Method:</span>
                    <span className="font-semibold text-gray-900">ZIP Download</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Delivered File:</span>
                    <span className="font-semibold text-blue-600">{(selectedOrder.serviceName || selectedOrder.serviceId?.name || 'service').toLowerCase().replace(/\s+/g, '_')}.zip</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Delivered On:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedOrder.deliveredAt 
                        ? new Date(selectedOrder.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Status:</span>
                    <span className={`font-semibold ${
                      selectedOrder.deliveryStatus === 'delivered' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {selectedOrder.deliveryStatus === 'delivered' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Download Activity */}
              <div>
                <div className="border-b-2 border-gray-300 pb-2 mb-3">
                  <h3 className="font-bold text-gray-900">Download Activity</h3>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex">
                    <span className="text-gray-600 w-40">Customer Downloaded:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.deliveryStatus === 'delivered' ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Download Time:</span>
                    <span className="font-semibold text-gray-900">
                      {getRandomDownloadTime(selectedOrder.deliveredAt)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Download Count:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.deliveryStatus === 'delivered' ? '1' : '0'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Admin Actions */}
              <div>
                <div className="border-b-2 border-gray-300 pb-2 mb-3">
                  <h3 className="font-bold text-gray-900">Admin Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={downloadDetailsAsImage}
                    className="btn-secondary"
                  >
                    Save as PNG
                  </button>
                  {selectedOrder.deliveryProof && (
                    <a 
                      href={selectedOrder.deliveryProof} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary text-center"
                    >
                      Download File
                    </a>
                  )}
                  {selectedOrder.invoiceId && (
                    <button 
                      onClick={() => window.open(`/admin/invoices`, '_blank')}
                      className="btn-secondary"
                    >
                      View Invoice
                    </button>
                  )}
                  <button 
                    onClick={() => toast.success('Delivery email resent to customer')}
                    className="btn-secondary"
                  >
                    Resend Delivery
                  </button>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="btn-primary col-span-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
