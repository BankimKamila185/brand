'use client';

import React from 'react';
import { Shield, Plus } from 'lucide-react';

export default function UsersPage() {
  const staff = [
    { name: 'Vikram Rathore', email: 'vikram@houseofkoala.com', role: 'Owner', status: 'ACTIVE' },
    { name: 'Maya Sen', email: 'maya@houseofkoala.com', role: 'Marketing', status: 'ACTIVE' },
    { name: 'Rohan D.', email: 'rohan.d@houseofkoala.com', role: 'Warehouse', status: 'ACTIVE' },
    { name: 'Sarah Khan', email: 'sarah@houseofkoala.com', role: 'Support', status: 'ACTIVE' }
  ];

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Staff Users</h1>
          <p className="text-xs text-[#71717A] mt-2">Manage team login parameters and assigned access logs.</p>
        </div>
        <button
          onClick={() => alert('Invite staff coming soon')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg hover:scale-105"
        >
          <Plus size={14} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Table */}
      <div className="admin-glass overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[#71717A] font-semibold bg-white/[0.01]">
              <th className="p-6">Name</th>
              <th className="p-6">Email</th>
              <th className="p-6">Assigned Role</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {staff.map((user, idx) => (
              <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                <td className="p-6 font-bold text-white text-sm">{user.name}</td>
                <td className="p-6 text-[#A1A1AA] font-mono font-medium">{user.email}</td>
                <td className="p-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-white/5 text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                    <Shield size={10} />
                    <span>{user.role}</span>
                  </span>
                </td>
                <td className="p-6 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-white/10 bg-white/5 text-white">
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
