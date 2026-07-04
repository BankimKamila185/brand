'use client';

import React, { useState } from 'react';
import { RotateCcw, Eye, ArrowUpRight } from 'lucide-react';

interface ReturnLog {
  id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  status: 'PENDING_PICKUP' | 'INSPECTED' | 'REFUNDED' | 'REJECTED';
  date: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnLog[]>([
    { id: 'ret-1', orderNumber: 'TOS-2026-9799', customerName: 'Simran K.', reason: 'Sizing too oversized, exchanging for M', status: 'PENDING_PICKUP', date: '2026-07-04' },
    { id: 'ret-2', orderNumber: 'TOS-2026-9780', customerName: 'Arjun Das', reason: 'Fabric blend preference mismatch', status: 'REFUNDED', date: '2026-06-30' }
  ]);

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Returns</h1>
        <p className="text-xs text-[#71717A] mt-2">Manage return tickets, inspection requests, and refund releases.</p>
      </div>

      {/* Table */}
      <div className="admin-glass overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
              <th className="p-6">Return ID</th>
              <th className="p-6">Order</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Return Reason</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {returns.map((ret) => (
              <tr key={ret.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="p-6 font-mono font-bold text-white text-sm">{ret.id}</td>
                <td className="p-6 font-bold text-white text-sm">{ret.orderNumber}</td>
                <td className="p-6 text-[#A1A1AA] font-medium">{ret.customerName}</td>
                <td className="p-6 text-[#71717A] font-medium leading-relaxed">{ret.reason}</td>
                <td className="p-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    ret.status === 'REFUNDED'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {ret.status}
                  </span>
                </td>
                <td className="p-6 text-right text-[#71717A] font-semibold">{ret.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
