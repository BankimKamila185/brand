import {
  FolderKanban,
  LayoutDashboard,
  Package,
  Percent,
  ReceiptText,
  Star,
  Tags,
  Users,
  Warehouse,
} from "lucide-react";

export const sidebarItems = [
  {
    id: 1,
    label: "Operations",
    items: [
      { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { id: "products", title: "Products", url: "/dashboard/products", icon: Package },
      { id: "orders", title: "Orders", url: "/dashboard/orders", icon: ReceiptText },
      { id: "coupons", title: "Coupons", url: "/dashboard/coupons", icon: Percent },
    ],
  },
  {
    id: 2,
    label: "Catalog & people",
    items: [
      { id: "categories", title: "Categories", url: "/dashboard/categories", icon: Tags },
      { id: "collections", title: "Collections", url: "/dashboard/collections", icon: FolderKanban },
      { id: "warehouses", title: "Warehouses", url: "/dashboard/warehouses", icon: Warehouse },
      { id: "users", title: "Users", url: "/dashboard/users", icon: Users },
      { id: "reviews", title: "Reviews", url: "/dashboard/reviews", icon: Star },
    ],
  },
];
