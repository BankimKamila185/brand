'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Receipt,
  Download,
  Truck,
  RotateCcw,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Bookmark,
  ExternalLink,
  X
} from 'lucide-react';
import { MOCK_ORDERS, DashboardOrder, OrderStatus } from '../mockData';

export default function OrdersPage() {
  const [orders, setProducts] = useState<DashboardOrder[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Status Badge Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'border-white/10 bg-white/5 text-white';
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'border-white bg-white text-black';
      case 'SHIPPED':
        return 'border-white/5 bg-transparent text-[#A1A1AA]';
      case 'PENDING':
        return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'border-red-500/20 bg-red-500/10 text-red-400';
      default:
        return 'border-white/10 text-white';
    }
  };

  // Open Order Panel details
  const openOrderPanel = (order: DashboardOrder) => {
    setSelectedOrder(order);
    setTrackingNumberInput(order.trackingNumber || '');
  };

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        const timestamp = new Date().toISOString();
        const newTimelineEvent = {
          status: newStatus,
          description: `Order status updated to ${newStatus} by admin.`,
          timestamp
        };
        return {
          ...o,
          status: newStatus,
          timeline: [...o.timeline, newTimelineEvent]
        };
      }
      return o;
    });

    setProducts(updated);
    const updatedSelected = updated.find(o => o.id === id);
    if (updatedSelected) setSelectedOrder(updatedSelected);
  };

  const handleSaveTracking = (id: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        const timestamp = new Date().toISOString();
        const newTimelineEvent = {
          status: o.status,
          description: `Tracking number added/updated: ${trackingNumberInput}`,
          timestamp
        };
        return {
          ...o,
          trackingNumber: trackingNumberInput,
          timeline: [...o.timeline, newTimelineEvent]
        };
      }
      return o;
    });

    setProducts(updated);
    const updatedSelected = updated.find(o => o.id === id);
    if (updatedSelected) setSelectedOrder(updatedSelected);
    alert('Tracking number updated.');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || o.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Orders</h1>
        <p className="text-xs text-[#71717A] mt-2">Manage customer invoices, order fulfillment and returns.</p>
      </div>

      {/* Navigation & Search */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
          {(['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeTab === tab
                  ? 'bg-white text-black border-white'
                  : 'border-white/5 text-[#A1A1AA] bg-[#181818] hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={15} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090909] border border-white/5 focus:border-white/20 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#71717A] outline-none transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="admin-glass flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center text-[#71717A]">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No orders found</p>
          </div>
        </div>
      ) : (
        <div className="admin-glass overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
                <th className="p-6">Order</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Status</th>
                <th className="p-6">Payment</th>
                <th className="p-6">Total</th>
                <th className="p-6">Date</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6 font-bold tracking-wider text-white">
                    {order.orderNumber}
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-white block text-sm">{order.customerName}</span>
                    <span className="text-[10px] text-[#71717A] block mt-1">{order.customerEmail}</span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      order.paymentStatus === 'PAID'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : order.paymentStatus === 'PENDING'
                        ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-white text-sm">₹{order.total.toLocaleString()}</td>
                  <td className="p-6 text-[#A1A1AA] font-semibold">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => openOrderPanel(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-white/5 hover:border-white/20 bg-[#121212] text-[#A1A1AA] hover:text-white rounded-full transition-all"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-2xl bg-[#121212] border-l border-white/5 z-50 overflow-y-auto flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#181818]">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">{selectedOrder.orderNumber}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#71717A] mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-[#71717A] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 p-8 space-y-8 text-[#A1A1AA]">
                <div className="p-5 bg-[#181818] border border-white/5 rounded-[20px]">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-4">Action Controls</span>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                          className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold rounded-full transition-all shadow-lg"
                        >
                          Fulfill (Process)
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                          className="px-4 py-2 border border-white/5 hover:border-white/20 text-[10px] font-bold rounded-full text-white bg-[#121212] transition-all"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                          className="px-4 py-2 border border-white/5 hover:border-white/20 text-[10px] font-bold rounded-full text-white bg-[#121212] transition-all"
                        >
                          Mark Delivered
                        </button>
                      </>
                    )}
                    {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                        className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 text-[10px] font-bold rounded-full text-red-400 bg-transparent hover:bg-red-500/5 transition-all"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Logistics Dispatch</span>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="DEL-xxxxxxxx-IND"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="flex-1 bg-[#090909] border border-white/5 rounded-full px-4 py-2 text-xs outline-none focus:border-white/20 transition-all text-white placeholder-[#71717A] font-mono"
                    />
                    <button
                      onClick={() => handleSaveTracking(selectedOrder.id)}
                      className="px-5 py-2 border border-white/5 hover:border-white/20 hover:bg-[#181818] text-xs font-bold rounded-full text-[#A1A1AA] hover:text-white transition-all bg-[#121212]"
                    >
                      Update Tracking
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Items Purchased</span>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-4 rounded-xl bg-[#181818] border border-white/5">
                        <div>
                          <p className="font-bold text-white text-sm">{item.title}</p>
                          <p className="text-[10px] text-[#71717A] mt-1 font-semibold">Variant: {item.variant} • Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-white text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5 p-5 bg-[#181818] border border-white/5 rounded-[20px] text-xs font-semibold">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-[#71717A]">
                      <span>Discount</span>
                      <span className="text-white">- ₹{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#71717A]">
                    <span>GST (Tax)</span>
                    <span>₹{selectedOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#71717A]">
                    <span>Shipping Charges</span>
                    <span>₹{selectedOrder.shippingCharge.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/5 pt-4 flex justify-between font-extrabold text-sm text-white">
                    <span>Total Payment</span>
                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Customer Info</span>
                    <div className="text-xs space-y-1.5 text-[#A1A1AA]">
                      <p className="font-bold text-white">{selectedOrder.customerName}</p>
                      <p>{selectedOrder.customerEmail}</p>
                      <p className="font-mono mt-1 text-[11px] font-semibold">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Shipping Destination</span>
                    <div className="text-xs space-y-1.5 text-[#A1A1AA]">
                      <p>{selectedOrder.shippingAddress.line1}</p>
                      {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                      <p className="font-bold text-white text-[10px] uppercase mt-2">{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => alert('Generating Invoice PDF...')}
                    className="flex items-center justify-center gap-2.5 p-4 bg-[#181818] border border-white/5 hover:border-white/15 rounded-xl text-xs font-bold transition-all text-[#A1A1AA] hover:text-white"
                  >
                    <FileText size={14} />
                    <span>Download Invoice</span>
                  </button>
                  <button
                    onClick={() => alert('Generating Shipping Label...')}
                    className="flex items-center justify-center gap-2.5 p-4 bg-[#181818] border border-white/5 hover:border-white/15 rounded-xl text-xs font-bold transition-all text-[#A1A1AA] hover:text-white"
                  >
                    <Truck size={14} />
                    <span>Print Shipping Label</span>
                  </button>
                </div>

                <div className="space-y-5">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Timeline Logs</span>
                  <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                    {selectedOrder.timeline.map((event, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-white ring-4 ring-black flex items-center justify-center" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white tracking-wider text-[10px] uppercase">{event.status}</span>
                            <span className="text-[9px] text-[#71717A] font-semibold">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-[#A1A1AA] leading-relaxed text-[11px]">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
