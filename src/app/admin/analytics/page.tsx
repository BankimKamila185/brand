'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PROFIT_DATA = [
  { month: 'Jan', revenue: 240, profit: 80, margin: 33 },
  { month: 'Feb', revenue: 320, profit: 110, margin: 34 },
  { month: 'Mar', revenue: 280, profit: 95, margin: 33 },
  { month: 'Apr', revenue: 450, profit: 160, margin: 35 },
  { month: 'May', revenue: 610, profit: 220, margin: 36 },
  { month: 'Jun', revenue: 580, profit: 210, margin: 36 },
  { month: 'Jul', revenue: 720, profit: 270, margin: 37 }
];

const SOURCE_DATA = [
  { name: 'Instagram Ads', value: 55 },
  { name: 'Direct Traffic', value: 20 },
  { name: 'Google Search', value: 15 },
  { name: 'Referrals', value: 10 }
];

const COLORS = ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A'];

export default function AnalyticsPage() {
  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Analytics</h1>
        <p className="text-xs text-[#71717A] mt-2">Track user traffic sources, checkouts conversion rates and profit margins.</p>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profit margins */}
        <div className="admin-glass p-8 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-[22px] font-bold text-white tracking-tight uppercase">Profit Margins</h2>
            <p className="text-[12px] text-[#71717A] mt-1">Comparison of gross revenue to net profits (in ₹ thousands)</p>
          </div>

          <div className="h-[320px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={PROFIT_DATA} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#181818',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Gross Revenue" fill="#FFFFFF" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" name="Net Profit" fill="#71717A" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="margin" name="Margin %" stroke="#A1A1AA" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic acquisition */}
        <div className="admin-glass p-8 space-y-6">
          <div>
            <h2 className="text-[22px] font-bold text-white tracking-tight uppercase">Traffic Sources</h2>
            <p className="text-[12px] text-[#71717A] mt-1">Acquisition channels distribution</p>
          </div>

          <div className="h-[250px] w-full flex items-center justify-center mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SOURCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#181818',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                  formatter={(v) => `${v}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px] pt-4 border-t border-white/5">
            {SOURCE_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-[#A1A1AA] truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
