"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, LogOut, Menu, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

export function AdminShell({ user, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="admin-shell min-h-screen bg-[#f5f5f3] text-zinc-950 md:grid md:grid-cols-[18rem_1fr]">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div
          className="admin-backdrop block md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Section */}
      <aside className={`admin-sidebar flex min-h-screen flex-col bg-[#121212] text-white ${isOpen ? "open" : ""}`}>
        <div className="admin-brand flex h-24 items-center gap-3 px-6">
          <img className="admin-brand-logo" src="/logo.svg" alt="The Outliers Studio" />
          <div>
            <span className="block text-lg font-semibold tracking-tight">The Outliers Studio</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Admin portal</span>
          </div>
        </div>
        
        {/* Sidebar Quick Action - Link to open New Product catalog form directly */}
        <div className="admin-sidebar-actions flex gap-2 px-4 pb-8">
          <Button
            asChild
            className="h-11 flex-1 justify-start rounded-xl bg-[#e65f36] px-3 text-white shadow-[0_8px_20px_rgba(230,95,54,.24)] hover:bg-[#f17048]"
          >
            <Link href="/dashboard/products?new=true" onClick={closeSidebar}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New product
            </Link>
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="admin-nav flex-1 space-y-7 px-4">
          {sidebarItems.map((group) => (
            <div className="admin-nav-group" key={group.id}>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url;
                  return (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={closeSidebar}
                      className={`admin-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10 hover:text-white ${
                        isActive ? "bg-white/10 text-white font-semibold" : "text-white/65"
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Help Card */}
        <div className="admin-help-card m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CircleHelp className="size-4 text-[#ff9a72]" />
            Need a hand?
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            Guides and support for your operations team.
          </p>
        </div>

        {/* User Card & Sign Out */}
        <div className="admin-user-card flex items-center gap-3 border-white/10 border-t px-5 py-5">
          <div className="grid size-9 place-items-center rounded-full bg-[#2a2a2a] font-semibold text-sm">
            {user?.name?.slice(0, 1) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name || "User"}</p>
            <p className="truncate text-xs text-white/40">{user?.email || "No email"}</p>
          </div>
          <Link
            href="/admin/login"
            aria-label="Sign out"
            className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="admin-main min-w-0 bg-[#f5f5f3]">
        {/* Topbar/Header */}
        <header className="admin-topbar sticky top-0 z-20 flex h-20 items-center justify-between border-zinc-200/80 border-b bg-[#f5f5f3]/85 px-6 backdrop-blur-xl lg:px-9">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Toggle Sidebar */}
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-xl hover:bg-zinc-200/50 transition-colors md:hidden focus:outline-none"
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="size-5 text-zinc-500" />
            </button>
            
            {/* Desktop spacer / search placeholder */}
            <div className="hidden md:block" />
          </div>

          <div className="flex items-center gap-2">
            {/* User Avatar Badge in Topbar */}
            <div className="grid size-9 place-items-center rounded-xl bg-[#121212] text-sm font-semibold text-white">
              {user?.name?.slice(0, 1) || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content mx-auto max-w-[1600px] p-5 lg:p-9">
          {children}
        </div>
      </main>
    </div>
  );
}
