'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, PlusIcon, EyeIcon, ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/admin/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to load orders');
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder }),
      });
      if (res.ok) {
        toast.success('Invoice generated successfully!');
        setShowModal(false);
        setSelectedOrder('');
        fetchInvoices();
      }
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv._id === invoiceId);
      if (!invoice) return;

      const order = invoice.orderId;
      const baseAmount = invoice.amount / 1.18;
      const gst = invoice.amount - baseAmount;

      const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
    .company { font-size: 24px; font-weight: bold; color: #4F46E5; }
    .tagline { font-size: 14px; color: #666; margin-top: 5px; }
    .address { font-size: 12px; color: #666; margin-top: 10px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
    .row { display: flex; justify-content: space-between; margin: 8px 0; }
    .label { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4F46E5; color: white; }
    .amount-summary { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #4F46E5; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; }
    .declaration { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .signature { margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">PPR SMART SYSTEM</div>
    <div class="tagline">IT & Digital Services Provider</div>
    <div class="address">
      Heavens Garden, Flat No 23<br>
      Lokhra, Lalganesh<br>
      Guwahati, Assam – 781034<br>
      <strong>GSTIN:</strong> 18AYFPD8046C1ZN<br>
      <strong>Email:</strong> support@pprsmartsystem.com
    </div>
  </div>

  <div class="section">
    <div class="section-title">INVOICE</div>
    <div class="row">
      <div><span class="label">Invoice No:</span> ${invoice.invoiceNumber}</div>
      <div><span class="label">Invoice Date:</span> ${new Date(order?.createdAt || invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
    <div class="row">
      <div><span class="label">Payment Gateway:</span> ${order?.paymentMethod?.charAt(0).toUpperCase() + order?.paymentMethod?.slice(1) || 'Razorpay'}</div>
      <div><span class="label">Payment Status:</span> <span style="color: green; font-weight: bold;">Paid</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <div><span class="label">Customer Name:</span> ${invoice.userId?.name}</div>
    <div><span class="label">Customer Email:</span> ${invoice.userId?.email}</div>
  </div>

  <div class="section">
    <div class="section-title">Service Details</div>
    <table>
      <thead>
        <tr>
          <th>Service Name</th>
          <th>Description</th>
          <th>Qty</th>
          <th>Price (₹)</th>
          <th>Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items?.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>Premium digital service with installation guide</td>
            <td>${item.quantity}</td>
            <td>₹${baseAmount.toFixed(2)}</td>
            <td>₹${baseAmount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="amount-summary">
    <div class="section-title">Amount Summary</div>
    <div class="row">
      <div>Subtotal:</div>
      <div>₹${baseAmount.toFixed(2)}</div>
    </div>
    <div class="row">
      <div>GST (18%):</div>
      <div>₹${gst.toFixed(2)}</div>
    </div>
    <div class="row total-row">
      <div>Total Amount Paid:</div>
      <div>₹${invoice.amount.toFixed(2)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Payment Details</div>
    <div class="row">
      <div><span class="label">Payment Method:</span> ${order?.paymentMethod?.charAt(0).toUpperCase() + order?.paymentMethod?.slice(1) || 'Razorpay'}</div>
      <div><span class="label">Transaction ID:</span> ${order?.paymentId || 'N/A'}</div>
    </div>
    <div class="row">
      <div><span class="label">Order ID:</span> ${order?.orderId}</div>
      <div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Service Delivery</div>
    <div class="row">
      <div><span class="label">Delivery Type:</span> Digital Service</div>
      <div><span class="label">Delivery Method:</span> Secure Download / Email Activation</div>
    </div>
    <div class="row">
      <div><span class="label">Delivery Status:</span> ${order?.deliveryStatus === 'delivered' ? 'Completed' : 'Pending'}</div>
      <div><span class="label">Delivery Date:</span> ${order?.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending'}</div>
    </div>
  </div>

  <div class="declaration">
    <strong>Declaration:</strong> This invoice confirms that the above digital service has been successfully delivered to the customer.
  </div>

  <div class="signature">
    <p>Authorized By</p>
    <p style="font-size: 20px; font-weight: bold; margin-top: 10px;">Pappu Das</p>
    <p style="color: #666;">PPR SMART SYSTEM</p>
  </div>

  <div class="footer" style="text-align: center; color: #666; font-size: 12px;">
    <p>Thank you for your business!</p>
    <p>For any queries, contact us at support@pprsmartsystem.com | +91 9403893296</p>
  </div>
</body>
</html>
      `;

      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoiceNumber}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded! Open and print as PDF');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleSendEmail = async (invoiceId) => {
    try {
      const res = await fetch('/api/admin/invoices/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      if (res.ok) {
        toast.success('Invoice sent via email');
      }
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-2">Generate and manage professional invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono font-semibold text-indigo-600">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{invoice.orderId?.orderId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{invoice.userId?.name}</p>
                      <p className="text-xs text-gray-500">{invoice.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => { setSelectedInvoice(invoice); setShowDetailsModal(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View Details">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDownloadPDF(invoice._id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Download PDF">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleSendEmail(invoice._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Send Email">
                          <EnvelopeIcon className="h-4 w-4" />
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
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Generate Invoice</h2>
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
                <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} className="input-field" required>
                  <option value="">-- Select Order --</option>
                  {orders.filter(o => o.status === 'completed').map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.orderId} - {order.userId?.name} - {formatCurrency(order.amount)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Generate</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Name:</p>
                <p className="text-base font-semibold text-gray-900">{selectedInvoice.userId?.name}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mail ID:</p>
                <p className="text-base font-semibold text-gray-900">{selectedInvoice.userId?.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                <p className="text-base font-semibold text-indigo-600">{selectedInvoice.orderId?.orderId}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Service:</p>
                <p className="text-base font-semibold text-gray-900">{selectedInvoice.orderId?.serviceName || selectedInvoice.orderId?.serviceId?.name || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Delivery Method:</p>
                <p className="text-base font-semibold text-gray-900">ZIP Download</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">File:</p>
                <p className="text-base font-semibold text-blue-600">{(selectedInvoice.orderId?.serviceName || selectedInvoice.orderId?.serviceId?.name || 'service').toLowerCase().replace(/\s+/g, '_')}.zip</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Delivered On:</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedInvoice.orderId?.deliveredAt 
                    ? new Date(selectedInvoice.orderId.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Pending'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status:</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedInvoice.orderId?.deliveryStatus === 'delivered' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedInvoice.orderId?.deliveryStatus === 'delivered' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>

            <button onClick={() => setShowDetailsModal(false)} className="w-full mt-6 btn-primary">
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
