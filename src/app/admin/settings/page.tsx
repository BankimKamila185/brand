'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Key, Sliders, Check, Lock, Plus } from 'lucide-react';

interface KeyConfig {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'keys'>('profile');
  const [storeName, setStoreName] = useState('House of Koala');
  const [storeEmail, setStoreEmail] = useState('hello@houseofkoala.com');
  const [gstRate, setGstRate] = useState(18);

  const [keys, setKeys] = useState<KeyConfig[]>([
    { id: 'k-1', name: 'Storefront Access Token', prefix: 'tos_sf_xxxxxxxxxxxxxxxx', createdAt: '2026-07-01' },
    { id: 'k-2', name: 'Razorpay Webhook Secret', prefix: 'tos_rzp_xxxxxxxxxxxxxxxx', createdAt: '2026-06-30' }
  ]);

  const handleGenerateKey = () => {
    const name = prompt('Enter API key name:');
    if (!name) return;
    const newKey: KeyConfig = {
      id: `k-${Date.now()}`,
      name,
      prefix: `tos_key_${Math.random().toString(36).substring(2, 10)}xxxxxxxx`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setKeys(prev => [newKey, ...prev]);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Shop configurations saved.');
  };

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Settings</h1>
        <p className="text-xs text-[#71717A] mt-2">Configure store profiles, assign roles capabilities, and generate API keys.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>Store Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rbac' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>Permissions (RBAC)</span>
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'keys' ? 'border-white text-white' : 'border-transparent text-[#71717A] hover:text-white'
            }`}
          >
            <Key size={14} />
            <span>API Keys</span>
          </button>
        </div>
      </div>

      {/* Tab Panel */}
      <div className="space-y-6">
        {/* 1. Profile */}
        {activeTab === 'profile' && (
          <div className="admin-glass p-8 max-w-xl space-y-6">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Shop Configs</span>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#71717A] font-bold uppercase">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 outline-none text-white font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#71717A] font-bold uppercase">Contact Email</label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 outline-none text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#71717A] font-bold uppercase">Default GST Rate (%)</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 outline-none text-white font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. RBAC */}
        {activeTab === 'rbac' && (
          <div className="admin-glass p-8 space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Roles Capabilities Matrix</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
                    <th className="p-4">Capability</th>
                    <th className="p-4 text-center">Owner</th>
                    <th className="p-4 text-center">Admin</th>
                    <th className="p-4 text-center">Manager</th>
                    <th className="p-4 text-center">Warehouse</th>
                    <th className="p-4 text-center">Marketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#A1A1AA]">
                  {[
                    { cap: 'Read Dashboard Analytics', roles: [true, true, true, false, true] },
                    { cap: 'Modify Product Catalog', roles: [true, true, true, false, false] },
                    { cap: 'Fulfill Orders Logistics', roles: [true, true, true, true, false] },
                    { cap: 'Issue Refunds Payments', roles: [true, true, false, false, false] },
                    { cap: 'Generate API Access Keys', roles: [true, false, false, false, false] }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="p-4 font-bold text-white text-sm">{row.cap}</td>
                      {row.roles.map((enabled, rIdx) => (
                        <td key={rIdx} className="p-4 text-center">
                          {enabled ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-white">
                              <Check size={12} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-transparent border border-white/5 text-[#71717A]">
                              <Lock size={10} />
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. API Keys */}
        {activeTab === 'keys' && (
          <div className="admin-glass p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Operator API Keys</h2>
              </div>
              <button
                onClick={handleGenerateKey}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg"
              >
                <Plus size={13} />
                <span>Generate Key</span>
              </button>
            </div>

            <div className="space-y-4">
              {keys.map(key => (
                <div key={key.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{key.name}</span>
                    <span className="font-mono text-[10px] text-[#71717A] block mt-1 font-semibold">Prefix: {key.prefix}</span>
                  </div>
                  <span className="text-[10px] text-[#71717A] font-semibold font-mono">Created: {key.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
