import "./admin.css";
import { AdminShell } from "./_components/admin-shell";

export const metadata = { title: "The Outliers Studio Admin", description: "Operations dashboard." };

export default async function AdminLayout({ children }) {
  const defaultAdmin = {
    id: "admin_master",
    name: "Admin",
    email: "admin@theoutliersstudio.com",
    role: "SUPER_ADMIN",
    dbRole: "SUPER_ADMIN",
  };

  return <AdminShell user={defaultAdmin}>{children}</AdminShell>;
}
