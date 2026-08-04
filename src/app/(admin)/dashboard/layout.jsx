import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./admin.css";

import { AdminShell } from "./_components/admin-shell";

export const metadata = { title: "Tevar Admin", description: "Tevar operations dashboard." };

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const accessToken = cookieStore.get("access_token")?.value;

  const rawBackendUrl = (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://brand-eo90.onrender.com"
  ).trim();

  const backendUrl =
    rawBackendUrl.startsWith("http://") || rawBackendUrl.startsWith("https://")
      ? rawBackendUrl
      : `https://${rawBackendUrl}`;

  let user = null;
  try {
    const headers = {
      cookie: cookieHeader,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      headers,
      cache: "no-store",
    });
    const payload = response.ok ? await response.json() : null;
    user = payload?.data || null;
  } catch (err) {
    console.error("Admin layout auth check error:", err);
    user = null;
  }

  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role || user.dbRole)) {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
