import {
  LayoutGrid,
  Users2,
  LineChart,
  Wallet,
  ShoppingCart,
  CalendarDays,
  CircleUserRound,
  Files,
} from "lucide-react";
import type { NavSection } from "./sideNavData.types";

export const sideNavData: NavSection[] = [
  {
    id: "1",
    title: "",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutGrid,
        subItems: [
          { label: "Ecommerce", path: "/dashboard" },
          { label: "Analytics", path: "/analytics" },
          { label: "Marketing", path: "/marketing" },
          { label: "CRM", path: "/crm" },
          { label: "Stocks", path: "/stocks" },
          { label: "SaaS", path: "/saas" },
          { label: "Logistics", path: "/logistics" },
        ],
      },
      { id: "crm", label: "CRM", icon: Users2, path: "/crm-standalone" },
      { id: "stocks", label: "Stocks", icon: LineChart, path: "/stocks-standalone" },
      {
        id: "sales",
        label: "Sales",
        icon: Wallet,
        // badge: "NEW",
        path: "/sales",
      },
      {
        id: "finance",
        label: "Finance",
        icon: Wallet,
        // badge: "NEW",
        path: "/finance",
      },
      {
        id: "ecommerce",
        label: "E-commerce",
        icon: ShoppingCart,
        subItems: [
          { label: "Products", path: "/ecommerce/products" },
          { label: "Orders", path: "/ecommerce/orders" },
          { label: "Invoices", path: "/ecommerce/invoices" },
        ],
      },
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
