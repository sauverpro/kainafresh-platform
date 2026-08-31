import {
  LayoutGrid,
  Users2,
  LineChart,
  Wallet,
  ShoppingCart,
  CalendarDays,
  CircleUserRound,
  Files,
  Warehouse,
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
        id: "crm",
        label: "CRM",
        icon: Users2,
        subItems: [
          { label: "Pages", otherSub: [] },
          { label: "Settings", path: "/crm/settings" },
        ],
      },
      {
        id: "ecommerce",
        label: "E-commerce",
        icon: ShoppingCart,
        subItems: [
          { label: "Products", path: "/admin/products" },
          { label: "Orders", path: "/ecommerce/orders" },
          { label: "Invoices", path: "/ecommerce/invoices" },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: Warehouse,
        path: "/inventory",
      },
      { id: "stocks", label: "Stocks", icon: LineChart, path: "/stocks" },
      { id: "sales", label: "Sales", icon: Wallet, path: "/sales" },
      { id: "finance", label: "Finance", icon: Wallet, path: "/finance" },
      { id: "calendar", label: "Calendar", icon: CalendarDays, path: "/calendar" },
      { id: "user-profile", label: "User Profile", icon: CircleUserRound, path: "/profile" },
      {
        id: "pages",
        label: "Pages",
        icon: Files,
        subItems: [
          { label: "Blank Page", path: "/pages/blank" },
          { label: "404 Error", path: "/pages/404" },
          { label: "Pricing Tables", path: "/pages/pricing" },
        ],
      },
    ],
  },
];
