import { useState } from "react";
import {
  Search,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertOctagon,
  SlidersHorizontal,
  Share2,
  Printer,
  RefreshCw,
  Plus,
} from "lucide-react";
import InvoiceDrawer, { type InvoiceRecord } from "../../../components/invoices/InvoiceDrawer";
import { toast } from "sonner";

// Initial Mock Dataset for Invoices Management
const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2026-089",
    order_id: "#KF-8942",
    customer_name: "Serena Hotel Kigali",
    customer_email: "procurement@serenahotels.rw",
    customer_phone: "+250 788 987 654",
    customer_tin: "102-491-002",
    district: "Nyarugenge",
    address: "KN 3 Ave, Nyarugenge",
    issue_date: "2026-08-25",
    due_date: "2026-09-09",
    status: "pending",
    payment_method: "Bank Wire / Corporate Invoice",
    momo_code: "492019",
    items: [
      { produce: "Hass Avocados", variety: "Hass", grade: "A", qty: 250, unit: "kg", price: 1200, total: 300000 },
      { produce: "Irish Potatoes", variety: "Kinigi", grade: "A", qty: 500, unit: "kg", price: 450, total: 225000 },
    ],
    subtotal: 525000,
    tax: 94500,
    total: 619500,
    notes: "Corporate Net-15 invoice. Delivery accepted by Chef Patrick.",
  },
  {
    id: "INV-2026-088",
    order_id: "#KF-8939",
    customer_name: "Simba Supermarket Gishushu",
    customer_email: "inventory@simbasupermarket.rw",
    customer_phone: "+250 788 333 444",
    customer_tin: "100-291-883",
    district: "Gasabo",
    address: "KG 7 Ave, Gishushu",
    issue_date: "2026-08-20",
    due_date: "2026-08-28",
    status: "overdue",
    payment_method: "Corporate Invoice",
    momo_code: "492019",
    items: [
      { produce: "Fresh Spinach & Kale", variety: "Local", grade: "A+", qty: 100, unit: "kg", price: 800, total: 80000 },
      { produce: "Organic Tomatoes", variety: "Ansell", grade: "A", qty: 300, unit: "kg", price: 900, total: 270000 },
    ],
    subtotal: 350000,
    tax: 63000,
    total: 413000,
    notes: "Overdue by 4 days. Payment reminder sent via WhatsApp.",
  },
  {
    id: "INV-2026-087",
    order_id: "#KF-8935",
    customer_name: "Jean-Paul Habimana",
    customer_email: "jeanpaul@kigali.rw",
    customer_phone: "+250 788 123 456",
    district: "Gasabo",
    address: "KG 14 Ave, Remera",
    issue_date: "2026-08-28",
    due_date: "2026-08-28",
    status: "paid",
    payment_method: "MTN Mobile Money",
    momo_code: "492019",
    items: [
      { produce: "Organic Produce Household Box", variety: "Mixed", grade: "A", qty: 1, unit: "box", price: 25000, total: 25000 },
    ],
    subtotal: 25000,
    tax: 0,
    total: 25000,
    notes: "Paid instantly via MoMo *182*8*1*492019#.",
  },
  {
    id: "INV-2026-086",
    order_id: "#KF-8930",
    customer_name: "Aline Murekatete",
    customer_email: "aline.murekatete@gmail.com",
    customer_phone: "+250 783 456 789",
    district: "Kicukiro",
    address: "KK 15 Rd, Niboye",
    issue_date: "2026-08-27",
    due_date: "2026-08-27",
    status: "paid",
    payment_method: "Airtel Money",
    items: [
      { produce: "Passion Fruit", variety: "Purple", grade: "A", qty: 20, unit: "kg", price: 1800, total: 36000 },
      { produce: "Sweet Oranges", variety: "Valencia", grade: "A", qty: 15, unit: "kg", price: 1200, total: 18000 },
    ],
    subtotal: 54000,
    tax: 0,
    total: 54000,
  },
  {
    id: "INV-2026-085",
    order_id: "#KF-8924",
    customer_name: "Inyange Exporters Ltd",
    customer_email: "exports@inyange.rw",
    customer_phone: "+250 788 555 777",
    customer_tin: "108-941-204",
    district: "Gasabo",
    address: "Masoro Free Zone",
    issue_date: "2026-08-15",
    due_date: "2026-08-30",
    status: "overdue",
    payment_method: "Bank Wire",
    items: [
      { produce: "Export Habanero Chilli", variety: "Red", grade: "Export", qty: 500, unit: "kg", price: 2200, total: 1100000 },
    ],
    subtotal: 1100000,
    tax: 198000,
    total: 1298000,
  },
];

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  // Bento Card Calculations
  const totalCount = invoices.length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const pendingRevenue = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.total, 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const overdueRevenue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  // Filtered List
  const filteredInvoices = invoices.filter((i) => {
    if (statusFilter === "paid" && i.status !== "paid") return false;
    if (statusFilter === "pending" && i.status !== "pending") return false;
    if (statusFilter === "overdue" && i.status !== "overdue") return false;

    if (methodFilter !== "all" && !i.payment_method.toLowerCase().includes(methodFilter.toLowerCase()))
      return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const matchId = i.id.toLowerCase().includes(q);
      const matchOrder = i.order_id.toLowerCase().includes(q);
      const matchCustomer = i.customer_name.toLowerCase().includes(q);
      const matchTin = (i.customer_tin ?? "").toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchCustomer && !matchTin) return false;
    }
    return true;
  });

  const handleMarkAsPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "paid" } : i))
    );
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice((prev) => (prev ? { ...prev, status: "paid" } : null));
    }
    toast.success(`Invoice #${id} marked as Paid & Cleared!`);
  };

  const handleQuickWhatsAppShare = (inv: InvoiceRecord) => {
    const cleanPhone = inv.customer_phone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hello ${inv.customer_name},\n\nHere is your official KainaFresh Produce Invoice *#${inv.id}* for Order *${inv.order_id}*.\n\n*Total Amount:* ${inv.total.toLocaleString()} RWF\n*Due Date:* ${inv.due_date}\n*Status:* ${inv.status.toUpperCase()}\n\n*Payment Instructions (MTN MoMo Pay):*\nDial *182*8*1*${inv.momo_code || "492019"}#\n\nView invoice online: https://kainafresh.rw/invoice/${inv.id}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invoices Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track tax invoices, monitor paid & overdue payments, and share PDF/WhatsApp invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Invoices refreshed")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => toast.info("Create invoice modal triggered")}
            className="flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition-all"
          >
            <Plus size={16} /> Issue New Invoice
          </button>
        </div>
      </div>

      {/* 1. Bento Summary Cards — 100% Homogeneous with StatCard.tsx */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Invoices */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
            <FileText className="h-5.5 w-5.5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Issued</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {totalCount}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              Tax Documents
            </span>
          </div>
        </div>

        {/* Card 2: Paid Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] dark:bg-green-500/15 dark:text-green-300">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid & Cleared ({paidCount})</p>
              <p className="mt-1.5 text-2xl font-semibold text-[#076935] dark:text-green-300">
                {(paidRevenue / 1000).toFixed(0)}k <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              Collected
            </span>
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments ({pendingCount})</p>
              <p className="mt-1.5 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {(pendingRevenue / 1000).toFixed(0)}k <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              Awaiting
            </span>
          </div>
        </div>

        {/* Card 4: Overdue Outstanding */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <AlertOctagon className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue ({overdueCount})</p>
              <p className="mt-1.5 text-2xl font-semibold text-red-600 dark:text-red-400">
                {(overdueRevenue / 1000000).toFixed(2)}M <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/15 dark:text-red-300">
              Action Required
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-gray-100/80 rounded-xl dark:bg-white/5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "paid"
                ? "bg-white text-[#076935] shadow-xs dark:bg-gray-800 dark:text-green-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-white text-amber-600 shadow-xs dark:bg-gray-800 dark:text-amber-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("overdue")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "overdue"
                ? "bg-white text-red-600 shadow-xs dark:bg-gray-800 dark:text-red-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Overdue ({overdueCount})
          </button>
        </div>

        {/* Search & Payment Method Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Invoice #, Order #, Customer, TIN..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-[#076935] focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-[#076935]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">All Payment Methods</option>
              <option value="Mobile Money">MTN / Airtel Mobile Money</option>
              <option value="Bank">Bank Wire / Corporate</option>
              <option value="Cash">Cash on Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Invoices Data Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider dark:bg-white/5 dark:border-white/10 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Invoice #</th>
                <th className="px-5 py-3.5 font-semibold">Order Ref</th>
                <th className="px-5 py-3.5 font-semibold">Customer / B2B Client</th>
                <th className="px-5 py-3.5 font-semibold">Issue Date</th>
                <th className="px-5 py-3.5 font-semibold">Due Date</th>
                <th className="px-5 py-3.5 font-semibold">Total (RWF)</th>
                <th className="px-5 py-3.5 font-semibold">Payment Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium">No invoices found</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {/* Invoice ID */}
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      #{inv.id}
                    </td>

                    {/* Order ID */}
                    <td className="px-5 py-4 font-semibold text-[#076935] dark:text-green-400">
                      {inv.order_id}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {inv.customer_name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {inv.payment_method}
                      </p>
                    </td>

                    {/* Issue Date */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {inv.issue_date}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${inv.status === "overdue" ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                        {inv.due_date}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      {inv.total.toLocaleString()} RWF
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-4">
                      {inv.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                          <CheckCircle size={12} /> Paid
                        </span>
                      ) : inv.status === "overdue" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                          <AlertOctagon size={12} /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleQuickWhatsAppShare(inv)}
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-white/10"
                          title="Share via WhatsApp"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                          title="View Official Invoice Drawer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                          title="Print / Save PDF"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Invoice Drawer */}
      <InvoiceDrawer
        open={Boolean(selectedInvoice)}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
}
