'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, DocumentTextIcon, CheckIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [newOrder, setNewOrder] = useState({
    userId: '',
    serviceId: '',
    serviceName: '',
    totalAmount: '',
    customerName: '',
    customerEmail: '',
    paymentMethod: 'razorpay',
    transactionId: '',
    orderDate: new Date().toISOString().split('T')[0],
    useCustomService: false,
  });

  useEffect(() => {
    fetchOrders();
    fetchServices();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterOrdersData();
  }, [orders, searchTerm, filterStatus, filterPayment]);

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

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to load services');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const filterOrdersData = () => {
    let filtered = [...orders];
    
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }
    
    if (filterPayment !== 'all') {
      filtered = filtered.filter(o => o.paymentMethod === filterPayment);
    }
    
    setFilteredOrders(filtered);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        toast.success('Order created successfully!');
        setShowCreateModal(false);
        setNewOrder({
          userId: '',
          serviceId: '',
          serviceName: '',
          totalAmount: '',
          customerName: '',
          customerEmail: '',
          paymentMethod: 'razorpay',
          transactionId: '',
          orderDate: new Date().toISOString().split('T')[0],
          useCustomService: false,
        });
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create order');
      }
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const calculateGST = (total) => {
    if (!total) return { amount: 0, gst: 0 };
    const amount = parseFloat(total) / 1.18;
    const gst = parseFloat(total) - amount;
    return { amount: amount.toFixed(2), gst: gst.toFixed(2) };
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      const res = await fetch('/api/admin/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        toast.success('Order marked as delivered');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        toast.success('Invoice generated');
      }
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const gstCalc = calculateGST(newOrder.totalAmount);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">{filteredOrders.length} orders found</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Order
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Payment Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="wallet">Wallet</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Payment</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono font-semibold text-indigo-600">{order.orderId}</span>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{order.userId?.name}</p>
                      <p className="text-xs text-gray-500">{order.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{order.serviceName || order.serviceId?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => handleGenerateInvoice(order._id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Generate Invoice">
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        {order.status !== 'completed' && (
                          <button onClick={() => handleMarkDelivered(order._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Mark Delivered">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </motion.div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!newOrder.useCustomService}
                        onChange={() => setNewOrder({...newOrder, useCustomService: false, serviceName: ''})}
                        className="mr-2"
                      />
                      Select from list
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={newOrder.useCustomService}
                        onChange={() => setNewOrder({...newOrder, useCustomService: true, serviceId: ''})}
                        className="mr-2"
                      />
                      Custom service
                    </label>
                  </div>
                  {!newOrder.useCustomService ? (
                    <select value={newOrder.serviceId} onChange={(e) => setNewOrder({...newOrder, serviceId: e.target.value})} className="input-field" required>
                      <option value="">-- Select Service --</option>
                      {services.map(s => (
                        <option key={s._id} value={s._id}>{s.name} - {formatCurrency(s.price)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newOrder.serviceName}
                      onChange={(e) => setNewOrder({...newOrder, serviceName: e.target.value})}
                      className="input-field"
                      placeholder="Enter custom service name"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input type="text" value={newOrder.customerName} onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                  <input type="email" value={newOrder.customerEmail} onChange={(e) => setNewOrder({...newOrder, customerEmail: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
                  <input type="date" value={newOrder.orderDate} onChange={(e) => setNewOrder({...newOrder, orderDate: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select value={newOrder.paymentMethod} onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})} className="input-field">
                    <option value="razorpay">Razorpay</option>
                    <option value="wallet">Wallet</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                  <input type="text" value={newOrder.transactionId} onChange={(e) => setNewOrder({...newOrder, transactionId: e.target.value})} className="input-field" placeholder="pay_1234567890" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (Including GST)</label>
                  <input type="number" step="0.01" value={newOrder.totalAmount} onChange={(e) => setNewOrder({...newOrder, totalAmount: e.target.value})} className="input-field" placeholder="10000" required />
                </div>
              </div>
              {newOrder.totalAmount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800"><strong>Base Amount:</strong> ₹{gstCalc.amount}</p>
                  <p className="text-sm text-blue-800"><strong>GST (18%):</strong> ₹{gstCalc.gst}</p>
                  <p className="text-sm text-blue-900 font-bold"><strong>Total:</strong> ₹{newOrder.totalAmount}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create Order</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
