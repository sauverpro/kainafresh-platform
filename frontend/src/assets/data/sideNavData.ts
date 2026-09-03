import {
  LayoutGrid,
  LayoutTemplate,
  Wallet,
  Warehouse,
  Users2,
  Settings,
} from "lucide-react";
import type { NavSection } from "./sideNavData.types";

export const sideNavData: NavSection[] = [
  {
    id: "menu",
    title: "",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutGrid,
        path: "/dashboard",
      },
      {
        id: "cms",
        label: "CMS",
        icon: LayoutTemplate,
        subItems: [
          { label: "Pages", otherSub: [] },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: Warehouse,
        subItems: [
          { label: "Products", path: "/admin/products" },
          { label: "Orders", path: "/admin/orders" },
          { label: "Invoices", path: "/ecommerce/invoices" },
          { label: "Stock", path: "/stock" },
        ],
      },
      {
        id: "customers",
        label: "Customers",
        icon: Users2,
        path: "/admin/customers",
      },
      { id: "sales", label: "Sales", icon: Wallet, path: "/sales" },
      { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];
