'use client';

import React from 'react';
import { CreditCard, Check, AlertTriangle } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Payments</h1>
        <p className="text-xs text-[#71717A] mt-2">Configure gateways, API credentials, and payouts rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gateways */}
        <div className="admin-glass p-8 lg:col-span-2 space-y-6">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Integrated Gateways</span>

          <div className="space-y-4">
            <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block text-sm">Razorpay Checkout API</span>
                <span className="text-[9px] text-[#71717A] block mt-1 font-semibold font-mono">Merchant ID: mid_live_89sa2d131a</span>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white text-[9px] font-bold flex items-center gap-1">
                <Check size={10} />
                <span>Active</span>
              </span>
            </div>

            <div className="p-5 bg-[#181818]/30 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block text-sm">Cash on Delivery (COD)</span>
                <span className="text-[9px] text-[#71717A] block mt-1">Enforced verification via SMS OTP</span>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-white/5 bg-transparent text-[#71717A] text-[9px] font-bold">
                <span>Disabled</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="admin-glass p-8 space-y-6">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Gateway Health</span>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between text-[#A1A1AA]">
              <span>Gateway Status</span>
              <span className="text-white">100% Operational</span>
            </div>
            <div className="flex items-center justify-between text-[#A1A1AA]">
              <span>Payout Period</span>
              <span className="text-white">T+2 Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
