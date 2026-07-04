'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Users,
  FolderKanban,
  Tag,
  Boxes,
  Megaphone,
  BarChart3,
  FileCode,
  Settings as SettingsIcon,
  Menu,
  X,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  Check
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommerceOpen, setIsCommerceOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order #TOS-9814 received', time: '5m ago', read: false },
    { id: 2, text: 'Low stock warning: Tactical Parachute Cargos', time: '1h ago', read: false },
    { id: 3, text: 'New review submitted for Aura Crochet Shirt', time: '3h ago', read: true },
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const commerceItems: SidebarItem[] = [
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Collections', href: '/admin/collections', icon: FolderKanban },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Orders', href: '/admin/orders', icon: Receipt }
  ];

  const managementItems: SidebarItem[] = [
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Content Builder', href: '/admin/homepage-builder', icon: FileCode },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon }
  ];

  return (
    <div className="admin-theme min-h-screen flex bg-[#F5F5F7] text-[#1D1D1F] antialiased">
      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[rgba(0,0,0,0.06)] bg-white transition-all duration-350 ease-in-out relative z-30 ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {/* Header Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[rgba(0,0,0,0.06)]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-sm shadow-sm transition-transform hover:scale-105">
              
            </span>
            {!isSidebarCollapsed && (
              <span className="font-semibold text-sm tracking-tight text-[#1D1D1F] font-sans">
                Tevar Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-md hover:bg-[rgba(0,0,0,0.03)] transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-5">
          {/* Dashboard (Root Overview) */}
          <div className="space-y-1">
            <Link
              href="/admin"
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                pathname === '/admin'
                  ? 'bg-[#0071E3]/8 text-[#0071E3] font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.03)]'
              }`}
            >
              <LayoutDashboard size={16} className={pathname === '/admin' ? 'text-[#0071E3]' : 'text-[#86868B]'} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {/* Commerce Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <div className="space-y-1">
                <button
                  onClick={() => setIsCommerceOpen(!isCommerceOpen)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[9px] font-semibold text-[#86868B] uppercase tracking-wider hover:text-[#1D1D1F] transition-colors"
                >
                  <span>eCommerce</span>
                  <ChevronDown size={11} className={`transition-transform duration-200 ${isCommerceOpen ? '' : '-rotate-90'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isCommerceOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-[2px]"
                    >
                      {commerceItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-[#0071E3]/8 text-[#0071E3] font-semibold'
                                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.03)]'
                            }`}
                          >
                            <Icon size={16} className={isActive ? 'text-[#0071E3]' : 'text-[#86868B]'} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-1.5 text-center">
                {commerceItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                        isActive ? 'bg-[#0071E3]/8 text-[#0071E3]' : 'text-[#86868B] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <Icon size={16} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Management Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <span className="text-[9px] font-semibold text-[#86868B] uppercase tracking-wider px-3 block mb-1.5">Management</span>
            )}

            {managementItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#0071E3]/8 text-[#0071E3] font-semibold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.03)]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#0071E3]' : 'text-[#86868B]'} />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.06)]">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.03)] transition-all font-medium"
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>View Store</span>}
          </Link>
        </div>
      </aside>

      {/* ─── SIDEBAR (Mobile) ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-[260px] bg-white border-r border-[rgba(0,0,0,0.06)] z-50 p-5 flex flex-col lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.06)] mb-5">
                <Link href="/admin" className="flex items-center gap-2.5 font-semibold">
                  <span className="w-7 h-7 rounded-lg bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-sm">
                    
                  </span>
                  <span className="font-semibold text-sm tracking-tight text-[#1D1D1F]">
                    Tevar Admin
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-md hover:bg-[rgba(0,0,0,0.03)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-grow space-y-6">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    pathname === '/admin' ? 'bg-[#0071E3]/8 text-[#0071E3] font-semibold' : 'text-[#6E6E73] hover:bg-[rgba(0,0,0,0.03)]'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>

                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-[#86868B] uppercase tracking-wider px-3 block mb-1.5">Commerce</span>
                  {commerceItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive ? 'bg-[#0071E3]/8 text-[#0071E3] font-semibold' : 'text-[#6E6E73] hover:bg-[rgba(0,0,0,0.03)]'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-[#86868B] uppercase tracking-wider px-3 block mb-1.5">Management</span>
                  {managementItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive ? 'bg-[#0071E3]/8 text-[#0071E3] font-semibold' : 'text-[#6E6E73] hover:bg-[rgba(0,0,0,0.03)]'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <Link
                  href="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#6E6E73] hover:bg-[rgba(0,0,0,0.03)] transition-all font-medium"
                >
                  <LogOut size={16} />
                  <span>View Store</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-6 lg:px-8 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4 flex-grow max-w-md">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-[#6E6E73] hover:text-[#1D1D1F] p-1.5 rounded-md hover:bg-[rgba(0,0,0,0.03)] transition-colors"
            >
              <Menu size={18} />
            </button>

            {/* Global Search Bar (Apple-like Pill) */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" size={14} />
              <input
                type="text"
                placeholder="Search resources, tags, actions..."
                className="w-full bg-[#F5F5F7] hover:bg-[#E8E8ED] focus:bg-white border border-transparent focus:border-[#0071E3] rounded-full py-1.5 pl-10 pr-4 text-xs text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* flag, notifications, cart, profile */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Flag / Language Selector (Apple Minimal) */}
              <button className="h-8 w-8 rounded-full hover:bg-[rgba(0,0,0,0.03)] flex items-center justify-center text-xs transition-colors">
                🇮🇳
              </button>

              {/* Checkmark System Status */}
              <button
                title="All systems operational"
                className="h-8 w-8 rounded-full text-[#34C759] hover:bg-[rgba(0,0,0,0.03)] flex items-center justify-center transition-colors"
              >
                <Check size={14} />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`h-8 w-8 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.03)] flex items-center justify-center transition-all relative ${showNotifications ? 'bg-[rgba(0,0,0,0.03)]' : ''}`}
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#FF3B30] text-white font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-35" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 z-40 p-4 shadow-xl bg-white border border-[rgba(0,0,0,0.06)] rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(0,0,0,0.04)]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-[#0071E3] hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {notifications.map((item) => (
                          <div key={item.id} className="text-[11px] flex flex-col gap-0.5">
                            <div className="flex items-start justify-between gap-3">
                              <span className={item.read ? 'text-[#86868B]' : 'text-[#1D1D1F] font-medium'}>
                                {item.text}
                              </span>
                              <span className="text-[8px] text-[#86868B] whitespace-nowrap">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Cart count badge */}
            <button className="h-8 w-8 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.03)] flex items-center justify-center transition-all relative">
              <span className="text-xs">🛒</span>
              <span className="absolute top-1 right-1 bg-[#0071E3] text-white font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                8
              </span>
            </button>

            {/* Profile Detail */}
            <div className="h-6 w-[1px] bg-[rgba(0,0,0,0.06)] mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.06)] bg-[#F5F5F7] flex items-center justify-center font-medium text-[10px] uppercase text-[#1D1D1F] overflow-hidden select-none">
                VR
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-grow overflow-y-auto p-6 lg:p-10 max-w-[1400px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            key={pathname}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
