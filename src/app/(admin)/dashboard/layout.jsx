import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./admin.css";

import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { AdminShell } from "./_components/admin-shell";

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
    <AdminShell user={user} sidebarItems={sidebarItems}>
      {children}
    </AdminShell>
  );
}
