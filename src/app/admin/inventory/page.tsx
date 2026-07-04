'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Plus,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Search,
  X
} from 'lucide-react';
import { MOCK_PRODUCTS, DashboardProduct } from '../mockData';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  itemsCount: number;
  totalCost: number;
  eta: string;
  createdAt: string;
}

const INITIAL_POS: PurchaseOrder[] = [
  { id: 'po-1', poNumber: 'PO-2026-0045', supplier: 'Vardhman Textiles Ltd', status: 'PENDING', itemsCount: 450, totalCost: 180000, eta: '2026-07-15', createdAt: '2026-07-02' },
  { id: 'po-2', poNumber: 'PO-2026-0044', supplier: 'Classic Knits Corp', status: 'RECEIVED', itemsCount: 800, totalCost: 320000, eta: '2026-07-01', createdAt: '2026-06-25' }
];

export default function InventoryPage() {
  const [products, setProducts] = useState<DashboardProduct[]>(MOCK_PRODUCTS);
  const [activeTab, setActiveTab] = useState<'levels' | 'orders' | 'logs'>('levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);

  // PO Form states
  const [poSupplier, setPoSupplier] = useState('');
  const [poItemsCount, setPoItemsCount] = useState(100);
  const [poTotalCost, setPoTotalCost] = useState(40000);
  const [poEta, setPoEta] = useState('2026-07-20');

  // Handle stock adjustment
  const handleAdjustStock = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, inventory: Math.max(p.inventory + amount, 0) };
      }
      return p;
    }));
  };

  // Submit Purchase Order
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplier) return;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-00${purchaseOrders.length + 45}`,
      supplier: poSupplier,
      status: 'PENDING',
      itemsCount: Number(poItemsCount),
      totalCost: Number(poTotalCost),
      eta: poEta,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setIsPOModalOpen(false);
    setPoSupplier('');
    alert('Purchase Order created.');
  };

  // Filter products
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-[32px]">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Inventory</h1>
          <p className="text-xs text-[#71717A] mt-2">Monitor warehouse levels, incoming POs, and logs.</p>
        </div>
        {activeTab === 'orders' && (
          <button
            onClick={() => setIsPOModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg hover:scale-105"
          >
            <Plus size={14} />
            <span>Create PO</span>
          </button>
        )}
      </div>

      {/* ─── Tabs & Filters ─── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('levels')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'levels' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
            }`}
          >
            <Warehouse size={14} />
            <span>Levels</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
            }`}
          >
            <Boxes size={14} />
            <span>Purchase Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'logs' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
            }`}
          >
            <History size={14} />
            <span>Movement Logs</span>
          </button>
        </div>

        {activeTab === 'levels' && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={15} />
            <input
              type="text"
              placeholder="Search levels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090909] border border-white/5 focus:border-white/20 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#71717A] outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="space-y-6">
        {activeTab === 'levels' && (
          <div className="admin-glass overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
                  <th className="p-6">SKU / Item</th>
                  <th className="p-6">Location</th>
                  <th className="p-6">Reserved</th>
                  <th className="p-6">Available</th>
                  <th className="p-6 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-6">
                      <span className="font-bold text-white block text-sm">{p.title}</span>
                      <span className="font-mono text-[10px] text-[#71717A] block mt-1 font-semibold">{p.sku}</span>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#A1A1AA]">
                        Mumbai A-09
                      </span>
                    </td>
                    <td className="p-6 text-[#71717A] font-semibold">
                      0 units
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${p.inventory < 20 ? 'text-yellow-400' : 'text-white'}`}>
                          {p.inventory} units
                        </span>
                        {p.inventory < 20 && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-yellow-400 border border-yellow-500/20 bg-yellow-500/5 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={10} />
                            <span>Low</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAdjustStock(p.id, -10)}
                          className="px-3 py-1.5 bg-[#121212] border border-white/5 hover:border-white/20 rounded-full text-[10px] font-bold text-[#A1A1AA] hover:text-white"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, -1)}
                          className="px-2.5 py-1.5 bg-[#121212] border border-white/5 hover:border-white/20 rounded-full text-[10px] font-bold text-[#A1A1AA] hover:text-white"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 1)}
                          className="px-2.5 py-1.5 bg-[#121212] border border-white/5 hover:border-white/20 rounded-full text-[10px] font-bold text-[#A1A1AA] hover:text-white"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 10)}
                          className="px-3 py-1.5 bg-[#121212] border border-white/5 hover:border-white/20 rounded-full text-[10px] font-bold text-[#A1A1AA] hover:text-white"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-glass overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
                  <th className="p-6">PO Number</th>
                  <th className="p-6">Supplier</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Quantity</th>
                  <th className="p-6">Value</th>
                  <th className="p-6 text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-6 font-mono font-bold text-white text-sm">
                      {po.poNumber}
                    </td>
                    <td className="p-6 text-white font-bold text-sm">{po.supplier}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        po.status === 'RECEIVED'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-6 text-[#A1A1AA] font-semibold">{po.itemsCount} units</td>
                    <td className="p-6 text-white font-bold text-sm">₹{po.totalCost.toLocaleString()}</td>
                    <td className="p-6 text-right text-[#A1A1AA] font-semibold">{po.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="admin-glass p-8 space-y-6">
            <div className="space-y-4">
              {[
                { time: '2026-07-04T12:05:00Z', type: 'RESTOCK', text: 'Restocked SKU TOS-CAR-TAC-02 by +50 units', user: 'Rohan D. (Warehouse)' },
                { time: '2026-07-04T11:30:00Z', type: 'SALE_DEDUCT', text: 'Order TOS-2026-9812: deducted items', user: 'System Checkout' }
              ].map((log, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                        log.type === 'RESTOCK'
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                          : 'border-white/10 bg-white/5 text-[#A1A1AA]'
                      }`}>
                        {log.type === 'RESTOCK' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span>{log.type}</span>
                      </span>
                      <span className="text-[10px] text-[#71717A] font-semibold">{new Date(log.time).toLocaleString()}</span>
                    </div>
                    <p className="font-bold text-white mt-2 text-sm">{log.text}</p>
                    <p className="text-[10px] text-[#71717A] mt-1">Operator: {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PO Modal */}
      <AnimatePresence>
        {isPOModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPOModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#121212] border border-white/5 z-50 p-6 rounded-2xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Create Purchase Order</h3>
                <button onClick={() => setIsPOModalOpen(false)} className="text-[#71717A] hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#71717A] font-bold uppercase">Supplier</label>
                  <input
                    type="text"
                    required
                    value={poSupplier}
                    onChange={(e) => setPoSupplier(e.target.value)}
                    className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2 outline-none text-white placeholder-[#71717A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#71717A] font-bold uppercase">Quantity</label>
                    <input
                      type="number"
                      required
                      value={poItemsCount}
                      onChange={(e) => setPoItemsCount(Number(e.target.value))}
                      className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2 outline-none text-white font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#71717A] font-bold uppercase">Cost (₹)</label>
                    <input
                      type="number"
                      required
                      value={poTotalCost}
                      onChange={(e) => setPoTotalCost(Number(e.target.value))}
                      className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2 outline-none text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#71717A] font-bold uppercase">ETA</label>
                  <input
                    type="date"
                    required
                    value={poEta}
                    onChange={(e) => setPoEta(e.target.value)}
                    className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2 outline-none text-white"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsPOModalOpen(false)}
                    className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-full text-[10px] font-bold text-[#A1A1AA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold rounded-full transition-all shadow-lg"
                  >
                    Submit PO
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
