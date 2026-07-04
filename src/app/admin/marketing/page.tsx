'use client';

import React, { useState } from 'react';
import { Megaphone, Mail, BellRing, Plus, Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  status: 'ACTIVE' | 'EXPIRED';
  minSpend: number;
}

export default function MarketingPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([
    { id: 'v-1', code: 'KOALA10', discountType: 'PERCENT', value: 10, status: 'ACTIVE', minSpend: 2500 },
    { id: 'v-2', code: 'FREESHIP', discountType: 'FIXED', value: 99, status: 'ACTIVE', minSpend: 1500 }
  ]);

  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignBody) return;
    alert(`Campaign dispatched: "${campaignTitle}" sent to subscribers.`);
    setCampaignTitle('');
    setCampaignBody('');
  };

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Marketing</h1>
        <p className="text-xs text-[#71717A] mt-2">Create coupons, broadcast newsletters, and compile campaigns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: discounts list */}
        <div className="admin-glass p-8 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-[22px] font-bold text-white tracking-tight uppercase">Active Coupons</h2>
              <p className="text-[12px] text-[#71717A] mt-1">Discount codes for storefront shopping carts</p>
            </div>
            <button
              onClick={() => alert('Add coupon coming soon')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-white/5 hover:border-white/15 hover:bg-[#181818] text-[10px] font-bold rounded-full text-[#A1A1AA] hover:text-white bg-[#121212] transition-all"
            >
              <Plus size={11} />
              <span>Add Code</span>
            </button>
          </div>

          <div className="space-y-4">
            {vouchers.map(v => (
              <div key={v.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-white text-sm block">{v.code}</span>
                  <span className="text-[10px] text-[#71717A] block mt-1 font-semibold">
                    {v.discountType === 'PERCENT' ? `${v.value}% Off` : `₹${v.value} Off`} • Min Spend: ₹{v.minSpend}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white text-[9px] font-bold">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: compose newsletter */}
        <div className="admin-glass p-8 space-y-6">
          <div>
            <h2 className="text-[22px] font-bold text-white tracking-tight uppercase">Campaign</h2>
            <p className="text-[12px] text-[#71717A] mt-1">Broadcast newsletters to subscribers</p>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#71717A] font-bold uppercase">Subject Line</label>
              <input
                type="text"
                required
                placeholder="Campaign Subject"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2 outline-none text-white placeholder-[#71717A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#71717A] font-bold uppercase">Content HTML</label>
              <textarea
                rows={5}
                required
                placeholder="Markdown copy..."
                value={campaignBody}
                onChange={(e) => setCampaignBody(e.target.value)}
                className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2 outline-none text-white placeholder-[#71717A] resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg"
            >
              <Send size={12} />
              <span>Send Campaign</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
