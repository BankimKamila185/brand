'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, Settings, Calendar, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Monthly sale data
const REVENUE_DATA = [
  { month: 'Jan', sale: 18 },
  { month: 'Feb', sale: 45 },
  { month: 'Mar', sale: 38 },
  { month: 'Apr', sale: 52 },
  { month: 'May', sale: 25 },
  { month: 'Jun', sale: 20 },
  { month: 'Jul', sale: 22 },
  { month: 'Aug', sale: 36 },
  { month: 'Sep', sale: 12 }
];

// Sparklines mockup datasets (Apple-like stocks sparklines)
const USERS_LINE_DATA = [
  { val: 10 }, { val: 25 }, { val: 15 }, { val: 30 }, { val: 20 }, { val: 35 }, { val: 25 }
];

const CLICKS_BAR_DATA = [
  { val: 15 }, { val: 25 }, { val: 35 }, { val: 45 }, { val: 55 }, { val: 65 }, { val: 75 }
];

const VIEWS_DOT_DATA = [
  { val: 20 }, { val: 40 }, { val: 30 }, { val: 50 }, { val: 35 }, { val: 55 }, { val: 45 }
];

const ACCOUNTS_AREA_DATA = [
  { val: 15 }, { val: 30 }, { val: 25 }, { val: 45 }, { val: 35 }, { val: 60 }, { val: 40 }
];

// Donut data with Apple System Colors
const DONUT_DATA = [
  { name: 'Desktop', value: 35, color: '#0071E3' }, // SF Blue
  { name: 'Tablet', value: 48, color: '#34C759' },  // SF Green
  { name: 'Mobile', value: 27, color: '#AF52DE' }  // SF Purple
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* ─── Apple-like Breadcrumbs & Top Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B]">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#1D1D1F]">Overview</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] mt-1">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Calendar pill */}
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all duration-200">
            <Calendar size={13} className="text-[#86868B]" />
            <span>Jul 2026</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all duration-200">
            <Settings size={13} className="text-[#86868B]" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ─── 12-Column Responsive Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Welcome Card (col-span-8) */}
        <div className="lg:col-span-8 admin-glass p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden bg-white">
          <div className="space-y-6 max-w-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                VR
              </div>
              <div>
                <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block">Workspace</span>
                <h2 className="text-xl font-semibold text-[#1D1D1F] leading-tight">Welcome back, Vikram.</h2>
              </div>
            </div>

            <p className="text-[#6E6E73] text-xs leading-relaxed max-w-sm">
              Your streetwear catalog is performing exceptionally today. Here is a quick snapshot of the core metrics and channels.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="space-y-1">
                <span className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">₹65,400</span>
                <span className="text-[11px] text-[#86868B] block font-medium">Today's Sales</span>
                <div className="w-24 h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-[#34C759]" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">78.4%</span>
                <span className="text-[11px] text-[#86868B] block font-medium">Growth Rate</span>
                <div className="w-24 h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-[#0071E3]" />
                </div>
              </div>
            </div>
          </div>

          {/* Illustration Container */}
          <div className="w-64 h-40 relative flex-shrink-0 z-0">
            <img
              src="/fashion_designer_workspace.png"
              alt="Fashion Designer Workspace"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
        </div>

        {/* 2. Top-Right KPI Widgets (col-span-4) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {/* Active Users (Circular Gauge Card) */}
          <div className="admin-glass p-6 bg-white flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">Active Users</span>
              <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight block">42.5K</span>
              <span className="text-[10px] text-[#86868B] font-medium block">24K increase this month</span>
            </div>

            {/* Circular Arc progress gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#F5F5F7]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#AF52DE]"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-medium text-[#1D1D1F]">78%</span>
            </div>
          </div>

          {/* Total Users (Line Sparkline Card) */}
          <div className="admin-glass p-6 bg-white flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">Total Users</span>
              <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight block">97.4K</span>
              <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-0.5">
                <TrendingUp size={11} />
                <span>12.5% from last month</span>
              </span>
            </div>

            {/* Recharts Green Sparkline */}
            <div className="w-20 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={USERS_LINE_DATA}>
                  <Line type="monotone" dataKey="val" stroke="#34C759" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. Monthly Revenue Bar Chart (col-span-5) */}
        <div className="lg:col-span-5 admin-glass p-6 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1D1D1F]">Monthly Revenue</h3>
              <p className="text-[10px] text-[#86868B] mt-0.5">Average monthly sale performance</p>
            </div>
            <button className="h-7 w-7 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#86868B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#86868B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.015)' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#1D1D1F',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                />
                <Bar dataKey="sale" fill="#0071E3" radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 mt-4 border-t border-[rgba(0,0,0,0.04)] flex items-center justify-between text-xs font-medium">
            <span className="text-[#6E6E73]">Average sales conversions</span>
            <span className="text-[#0071E3]">68.9%</span>
          </div>
        </div>

        {/* 4. Device Type Donut Pie Chart (col-span-4) */}
        <div className="lg:col-span-4 admin-glass p-6 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1D1D1F]">Device Type</h3>
              <p className="text-[10px] text-[#86868B] mt-0.5">Conversions channels distribution</p>
            </div>
            <button className="h-7 w-7 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {DONUT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFF" strokeWidth={1.5} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute text-center space-y-0.5">
              <span className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">68%</span>
              <span className="text-[8px] text-[#86868B] font-semibold uppercase block tracking-wider">Total Views</span>
            </div>
          </div>

          {/* Legend items list */}
          <div className="space-y-2.5 pt-3 mt-4 border-t border-[rgba(0,0,0,0.04)] text-xs font-medium text-[#6E6E73]">
            {DONUT_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="text-[#1D1D1F] font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Clicks/Views/Accounts Stacked sparklines (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Total Clicks (Vertical colorful bars) */}
          <div className="admin-glass p-5 bg-white flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">Total Clicks</span>
              <span className="text-2xl font-semibold text-[#1D1D1F] tracking-tight block">82.7K</span>
              <span className="text-[9px] text-[#34C759] font-medium block pt-1">12.5% increase</span>
            </div>

            {/* Sparkline BarChart */}
            <div className="w-16 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CLICKS_BAR_DATA}>
                  <Bar dataKey="val" fill="#AF52DE" radius={[1.5, 1.5, 0, 0]} barSize={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Views (Dotted line sparkline) */}
          <div className="admin-glass p-5 bg-white flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">Total Views</span>
              <span className="text-2xl font-semibold text-[#1D1D1F] tracking-tight block">68.4K</span>
              <span className="text-[9px] text-[#86868B] font-medium block pt-1">35K active users</span>
            </div>

            {/* Sparkline Dotted Line */}
            <div className="w-16 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VIEWS_DOT_DATA}>
                  <Line type="monotone" dataKey="val" stroke="#FF9500" strokeWidth={1.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Accounts (Area sparkline) */}
          <div className="admin-glass p-5 bg-white flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">Accounts</span>
                <span className="text-[9px] text-[#34C759] flex items-center gap-0.5 font-semibold">
                  <ArrowUpRight size={10} />
                  <span>23.7%</span>
                </span>
              </div>
              <span className="text-2xl font-semibold text-[#1D1D1F] tracking-tight block">85,247</span>
              <span className="text-[9px] text-[#86868B] font-medium block pt-1">Active database logs</span>
            </div>

            {/* Sparkline Area chart */}
            <div className="w-16 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACCOUNTS_AREA_DATA}>
                  <defs>
                    <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071E3" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="val" stroke="#0071E3" strokeWidth={1.5} fill="url(#colorAccounts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
