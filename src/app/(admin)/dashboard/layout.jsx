import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./admin.css";

import { Bell, CircleHelp, LogOut, Mail, Menu, PlusCircle, Search, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

export const metadata = { title: "Tevar Admin", description: "Tevar operations dashboard." };

export default async function AdminLayout({ children }) {
  const cookieHeader = (await cookies()).toString();
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  let user = null;
  try {
    const response = await fetch(`${backendUrl}/api/auth/me`, { headers: { cookie: cookieHeader }, cache: "no-store" });
    const payload = response.ok ? await response.json() : null;
    user = payload?.data || null;
  } catch {
    // The backend may briefly restart while the admin app is running.
    user = null;
  }
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role || user.dbRole)) redirect("/admin/login");

  return (
    <div className="admin-shell min-h-screen bg-[#f5f5f3] text-zinc-950 md:grid md:grid-cols-[18rem_1fr]">
      <aside className="admin-sidebar flex min-h-screen flex-col bg-[#121212] text-white">
        <div className="admin-brand flex h-24 items-center gap-3 px-6">
          <img className="admin-brand-logo" src="/logo.svg" alt="The Outliers Studio" />
          <div><span className="block text-lg font-semibold tracking-tight">The Outliers Studio</span><span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Admin portal</span></div>
        </div>
        <div className="admin-sidebar-actions flex gap-2 px-4 pb-8">
          <Button asChild className="h-11 flex-1 justify-start rounded-xl bg-[#e65f36] px-3 text-white shadow-[0_8px_20px_rgba(230,95,54,.24)] hover:bg-[#f17048]"><Link href="/dashboard/products"><PlusCircle />New product</Link></Button>
          <Button size="icon-lg" variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Mail /></Button>
        </div>
        <nav className="admin-nav flex-1 space-y-7 px-4">
          {sidebarItems.map((group) => (
            <div className="admin-nav-group" key={group.id}>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return <Link key={item.id} href={item.url} className="admin-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-all hover:bg-white/10 hover:text-white"><Icon className="size-4" />{item.title}</Link>;
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="admin-help-card m-4 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><CircleHelp className="size-4 text-[#ff9a72]" />Need a hand?</div><p className="mt-2 text-xs leading-relaxed text-white/45">Guides and support for your operations team.</p></div>
        <div className="admin-user-card flex items-center gap-3 border-white/10 border-t px-5 py-5"><div className="grid size-9 place-items-center rounded-full bg-[#2a2a2a] font-semibold text-sm">{user.name?.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-white/40">{user.email}</p></div><Link href="/admin/login" aria-label="Sign out" className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"><LogOut className="size-4" /></Link></div>
      </aside>
      <main className="admin-main min-w-0 bg-[#f5f5f3]">
        <header className="admin-topbar sticky top-0 z-20 flex h-20 items-center justify-between border-zinc-200/80 border-b bg-[#f5f5f3]/85 px-6 backdrop-blur-xl lg:px-9"><div className="flex items-center gap-4"><Menu className="size-5 text-zinc-500" /><div className="hidden w-80 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 md:flex"><Search className="size-4 text-zinc-400" /><Input placeholder="Search anything" className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" /></div></div><div className="flex items-center gap-2"><Button size="icon" variant="outline" className="rounded-xl border-zinc-200 bg-white"><Settings2 /></Button><Button size="icon" variant="outline" className="rounded-xl border-zinc-200 bg-white"><Bell /></Button><div className="ml-2 grid size-9 place-items-center rounded-xl bg-[#121212] text-sm font-semibold text-white">{user.name?.slice(0, 1)}</div></div></header>
        <div className="admin-content mx-auto max-w-[1600px] p-5 lg:p-9">{children}</div>
      </main>
    </div>
  );
}
