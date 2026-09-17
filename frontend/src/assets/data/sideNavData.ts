import {
  LayoutGrid,
  LayoutTemplate,
  Wallet,
  Warehouse,
  Users2,
  Users,
  Settings,
} from "lucide-react";
import type { NavSection } from "./sideNavData.types";

export const sideNavData: NavSection[] = [
  {
    id: "menu",
    title: "MAIN MENU",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutGrid,
        path: "/dashboard",
      },
      {
        id: "hr",
        label: "Human Resources",
        icon: Users,
        subItems: [
          { label: "HR Dashboard", path: "/admin/hr/dashboard" },
          { label: "Departments", path: "/admin/hr/departments" },
          { label: "Employee Profiles", path: "/admin/hr/employees" },
          { label: "Employment Records", path: "/admin/hr/employment-records" },
          { label: "Leave Management", path: "/admin/hr/leave" },
          { label: "Payroll", path: "/admin/hr/payroll" },
          { label: "Performance", path: "/admin/hr/performance" },
          { label: "Training & Development", path: "/admin/hr/training" },
          { label: "Health & Safety", path: "/admin/hr/health-safety" },
          { label: "Insurance", path: "/admin/hr/insurance" },
        ],
      },
      {
        id: "cms",
        label: "CMS",
        icon: LayoutTemplate,
        subItems: [
          { label: "Pages", otherSub: [] },
          { label: "Settings", path: "/cms/settings" },
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
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        path: "/settings",
      },
    ],
  },
];

