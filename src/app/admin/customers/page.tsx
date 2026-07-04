'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  Award,
  DollarSign,
  ShoppingCart,
  FileText,
  Save,
  X,
  MapPin,
  Heart
} from 'lucide-react';
import { MOCK_CUSTOMERS, DashboardCustomer } from '../mockData';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<DashboardCustomer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<DashboardCustomer | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'wishlist' | 'orders' | 'addresses'>('orders');
  const [editingNotes, setEditingNotes] = useState('');

  // Open detail panel
  const handleSelectCustomer = (customer: DashboardCustomer) => {
    setSelectedCustomer(customer);
    setEditingNotes(customer.notes);
  };

  // Save Customer Notes
  const handleSaveNotes = (id: string) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, notes: editingNotes };
      }
      return c;
    });
    setCustomers(updated);
    // Sync selection
    const updatedSelected = updated.find(c => c.id === id);
    if (updatedSelected) setSelectedCustomer(updatedSelected);
    alert('Customer notes saved.');
  };

  // Adjust Loyalty Points
  const handleAdjustPoints = (id: string, amount: number) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, loyaltyPoints: Math.max(c.loyaltyPoints + amount, 0) };
      }
      return c;
    });
    setCustomers(updated);
    // Sync selection
    const updatedSelected = updated.find(c => c.id === id);
    if (updatedSelected) setSelectedCustomer(updatedSelected);
  };

  // Filter Logic
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Customers</h1>
        <p className="text-xs text-[#71717A] mt-2">Manage customer accounts, purchase value logs, and point balances.</p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={15} />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#090909] border border-white/5 focus:border-white/20 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#71717A] outline-none transition-all"
        />
      </div>

      {/* Customers Table (Spacious) */}
      {filteredCustomers.length === 0 ? (
        <div className="admin-glass flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center text-[#71717A]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No customers found</p>
          </div>
        </div>
      ) : (
        <div className="admin-glass overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
                <th className="p-6">Customer</th>
                <th className="p-6">Loyalty Balance</th>
                <th className="p-6">Orders</th>
                <th className="p-6">Total Spent</th>
                <th className="p-6 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <span className="font-bold text-white block text-sm">{customer.name}</span>
                    <span className="text-[10px] text-[#71717A] block mt-1">{customer.email}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Award size={14} className="text-[#71717A]" />
                      <span>{customer.loyaltyPoints} pts</span>
                    </div>
                  </td>
                  <td className="p-6 text-[#A1A1AA] font-semibold">
                    {customer.totalOrdersCount} orders
                  </td>
                  <td className="p-6 text-white font-bold text-sm">
                    ₹{customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => handleSelectCustomer(customer)}
                      className="px-4 py-2 border border-white/5 hover:border-white/20 bg-[#121212] text-[#A1A1AA] hover:text-white rounded-full transition-all"
                    >
                      Manage
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
        {selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
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
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">{selectedCustomer.name}</h2>
                  <p className="text-[10px] text-[#71717A] mt-1">Ref ID: {selectedCustomer.id} • Phone: {selectedCustomer.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-[#71717A] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 p-8 space-y-8 text-[#A1A1AA]">
                {/* Highlights Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Loyalty Points */}
                  <div className="p-5 bg-[#181818] border border-white/5 rounded-[20px]">
                    <div className="flex items-center gap-1.5 text-[#71717A]">
                      <Award size={13} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Points</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{selectedCustomer.loyaltyPoints} pts</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustPoints(selectedCustomer.id, -50)}
                          className="w-6 h-6 bg-[#121212] border border-white/5 hover:border-white/20 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleAdjustPoints(selectedCustomer.id, 50)}
                          className="w-6 h-6 bg-[#121212] border border-white/5 hover:border-white/20 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Spent */}
                  <div className="p-5 bg-[#181818] border border-white/5 rounded-[20px]">
                    <div className="flex items-center gap-1.5 text-[#71717A]">
                      <DollarSign size={13} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Spent</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-3">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>

                  {/* Orders count */}
                  <div className="p-5 bg-[#181818] border border-white/5 rounded-[20px]">
                    <div className="flex items-center gap-1.5 text-[#71717A]">
                      <ShoppingCart size={13} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Purchases</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-3">{selectedCustomer.totalOrdersCount} orders</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={12} />
                      <span>Merchant Notes</span>
                    </span>
                    <button
                      onClick={() => handleSaveNotes(selectedCustomer.id)}
                      className="flex items-center gap-1.5 text-[10px] text-white hover:underline font-bold"
                    >
                      <Save size={10} />
                      <span>Save</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full bg-[#090909] border border-white/5 rounded-xl p-4 text-xs outline-none focus:border-white/20 transition-all text-white placeholder-[#71717A] resize-none leading-relaxed"
                  />
                </div>

                {/* Sub-tabs */}
                <div className="space-y-5">
                  <div className="flex items-center gap-6 border-b border-white/5 pb-2">
                    <button
                      onClick={() => setActiveSubTab('orders')}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                        activeSubTab === 'orders' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
                      }`}
                    >
                      Orders ({selectedCustomer.orderIds.length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('wishlist')}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                        activeSubTab === 'wishlist' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
                      }`}
                    >
                      Wishlist ({selectedCustomer.wishlist.length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('addresses')}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                        activeSubTab === 'addresses' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
                      }`}
                    >
                      Addresses ({selectedCustomer.addresses.length})
                    </button>
                  </div>

                  <div className="min-h-[160px]">
                    {activeSubTab === 'orders' && (
                      <div className="space-y-3">
                        {selectedCustomer.orderIds.map((orderId, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-4 rounded-xl bg-[#181818] border border-white/5">
                            <div>
                              <p className="font-bold text-white text-sm">Ref ID: {orderId}</p>
                              <p className="text-[10px] text-[#71717A] mt-1">Direct checkout</p>
                            </div>
                            <span className="font-bold text-white text-sm">₹{selectedCustomer.totalSpent.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSubTab === 'wishlist' && (
                      <div className="space-y-3">
                        {selectedCustomer.wishlist.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-4 rounded-xl bg-[#181818] border border-white/5">
                            <div className="flex items-center gap-2">
                              <Heart size={13} className="text-white/10 fill-white/10" />
                              <span className="font-bold text-white">{item.productTitle}</span>
                            </div>
                            <span className="text-[10px] text-[#71717A] font-mono">Added: {item.addedAt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSubTab === 'addresses' && (
                      <div className="space-y-3">
                        {selectedCustomer.addresses.map((addr, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-2 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[9px] text-[#71717A]">{addr.label} Address</span>
                            <div className="text-[#A1A1AA] leading-relaxed font-semibold">
                              <p className="font-bold text-white">{addr.line1}</p>
                              <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
