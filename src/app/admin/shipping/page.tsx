'use client';

import React, { useState } from 'react';
import { Truck, Plus, Check } from 'lucide-react';

interface Carrier {
  id: string;
  name: string;
  service: string;
  status: 'ACTIVE' | 'DISABLED';
  rateCardType: string;
}

export default function ShippingPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([
    { id: 'c-1', name: 'Delhivery Direct', service: 'Air Express', status: 'ACTIVE', rateCardType: 'Zone weight-based' },
    { id: 'c-2', name: 'BlueDart Live', service: 'Premium Express COD', status: 'ACTIVE', rateCardType: 'Zone weight-based' }
  ]);

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Shipping</h1>
        <p className="text-xs text-[#71717A] mt-2">Configure carrier services, routing, and delivery zones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logistics Carriers */}
        <div className="admin-glass p-8 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-[22px] font-bold text-white tracking-tight uppercase">Integrated Carriers</h2>
              <p className="text-[12px] text-[#71717A] mt-1">Delivery API connections status</p>
            </div>
            <button
              onClick={() => alert('Add carrier coming soon')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-white/5 hover:border-white/15 hover:bg-[#181818] text-[10px] font-bold rounded-full text-[#A1A1AA] hover:text-white bg-[#121212] transition-all"
            >
              <Plus size={11} />
              <span>Add Carrier</span>
            </button>
          </div>

          <div className="space-y-4">
            {carriers.map(c => (
              <div key={c.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-white text-sm block">{c.name}</span>
                  <span className="text-[10px] text-[#71717A] block font-semibold">Service: {c.service} • Rate Model: {c.rateCardType}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white text-[9px] font-bold flex items-center gap-1">
                  <Check size={10} />
                  <span>{c.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Zones summary */}
        <div className="admin-glass p-8 space-y-6">
          <div>
            <h2 className="text-[22px] font-bold text-white tracking-tight uppercase">Active Zones</h2>
            <p className="text-[12px] text-[#71717A] mt-1">Delivery fees configured by region</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-[#A1A1AA]">
              <span>Zone A (Metro Cities)</span>
              <span className="text-white font-extrabold">Free Shipping</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-[#A1A1AA]">
              <span>Zone B (Rest of India)</span>
              <span className="text-white font-extrabold">₹99 per order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
