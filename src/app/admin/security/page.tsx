'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { MOCK_ACTIVITY_LOGS } from '../mockData';

export default function SecurityPage() {
  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Security</h1>
        <p className="text-xs text-[#71717A] mt-2">Audit operational access paths, admin activities and session timeouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs */}
        <div className="admin-glass p-8 lg:col-span-2 space-y-6">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Recent Actions Logs</span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#71717A] font-semibold">
                  <th className="pb-4">User</th>
                  <th className="pb-4">Action</th>
                  <th className="pb-4">Details</th>
                  <th className="pb-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#A1A1AA]">
                {MOCK_ACTIVITY_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-bold text-white text-sm">
                      <span>{log.user}</span>
                      <span className="block text-[9px] text-[#71717A] mt-1 font-semibold">IP: {log.ipAddress}</span>
                    </td>
                    <td className="py-4 font-mono text-[9px] text-[#A1A1AA] font-semibold">{log.action}</td>
                    <td className="py-4 text-[#A1A1AA] font-medium">{log.details}</td>
                    <td className="py-4 text-right text-[#71717A] font-semibold">{new Date(log.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policies */}
        <div className="admin-glass p-8 space-y-6">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Active Policies</span>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between text-[#71717A]">
              <span>2FA Verification</span>
              <span className="text-white">Enabled (Global)</span>
            </div>
            <div className="flex items-center justify-between text-[#71717A]">
              <span>Session Timeout</span>
              <span className="text-white">30 minutes</span>
            </div>
            <div className="flex items-center justify-between text-[#71717A]">
              <span>SSL Status</span>
              <span className="text-white flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Secure HSTS</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
