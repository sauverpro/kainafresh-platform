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
        role:["admin"]
      },
      {
        id: "cms",
        label: "CMS",
        icon: LayoutTemplate,
        role:["admin"],
        subItems: [
          { label: "Pages", otherSub: [] ,role:["admin"],}
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
        role:["admin","sales-manager"]
      },
      {
        id: "customers",
        label: "Customers",
        icon: Users2,
        path: "/admin/customers",
        role:["admin","sales-manager"]
      },
      { id: "sales", label: "Sales", icon: Wallet, path: "/sales" ,role:["admin","sales-manager"]},
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        role:["admin"],
        subItems: [
          { label: "General", path: "/settings", role:["admin"] },
          { label: "User Management", path: "/admin/users", role:["admin"] },
        ],
      },
    ],
  },
];
