import { useState } from "react";
import {
  X,
  Printer,
  Share2,
  Mail,
  Copy,
  CheckCircle,
  Clock,
  AlertOctagon,
  CreditCard,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export interface InvoiceItem {
  produce: string;
  variety?: string;
  grade?: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface InvoiceRecord {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_tin?: string;
  district: string;
  address: string;
  issue_date: string;
  due_date: string;
  status: "paid" | "pending" | "overdue" | "draft";
  payment_method: string;
  momo_code?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface InvoiceDrawerProps {
  invoice: InvoiceRecord | null;
  open: boolean;
  onClose: () => void;
  onMarkAsPaid?: (id: string) => void;
}

export default function InvoiceDrawer({
  invoice,
  open,
  onClose,
  onMarkAsPaid,
}: InvoiceDrawerProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!open || !invoice) return null;

  const isOverdue = invoice.status === "overdue";
  const isPaid = invoice.status === "paid";

  // Share Actions
  const handleWhatsAppShare = () => {
    const cleanPhone = invoice.customer_phone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hello ${invoice.customer_name},\n\nHere is your official KainaFresh Produce Invoice *#${invoice.id}* for Order *${invoice.order_id}*.\n\n*Total Amount:* ${invoice.total.toLocaleString()} RWF\n*Due Date:* ${invoice.due_date}\n*Status:* ${invoice.status.toUpperCase()}\n\n*Payment Instructions (MTN MoMo Pay):*\nDial *182*8*1*${invoice.momo_code || "492019"}#\n\nView invoice online: https://kainafresh.rw/invoice/${invoice.id}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleCopyLink = () => {
    const link = `https://kainafresh.rw/invoice/${invoice.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Public invoice link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = () => {
    toast.success(`Invoice email sent to ${invoice.customer_email}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border-l dark:border-white/10 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header & Quick Action Buttons */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#076935]/10 px-3 py-1 text-xs font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                  Invoice #{invoice.id}
                </span>
                {isPaid ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                    <CheckCircle size={12} /> Paid & Cleared
                  </span>
                ) : isOverdue ? (
                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                    <AlertOctagon size={12} /> Overdue Payment
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <Clock size={12} /> Awaiting Payment
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                  title="Print Invoice"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sharing Methods Toolbar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-3 dark:bg-white/5">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">
                Share Invoice:
              </span>
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                <Share2 size={14} /> WhatsApp Share
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                <Mail size={14} /> Send Email
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
              >
                {copiedLink ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>

            {/* Printable Document Box */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 printable-invoice">
              {/* Document KainaFresh Brand Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 dark:border-white/10 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#076935] text-white font-bold text-sm">
                      KF
                    </div>
                    <h2 className="text-xl font-extrabold text-[#076935] dark:text-green-400 tracking-tight">
                      KainaFresh Ltd
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Organic Farm Produce & B2B Wholesale Supply
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    KG 123 St, Kigali, Rwanda · TIN: 109-842-941
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    TAX INVOICE
                  </h3>
                  <p className="text-xs font-bold text-[#076935] dark:text-green-400">
                    #{invoice.id}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Order Ref: <strong className="text-gray-800 dark:text-gray-200">{invoice.order_id}</strong>
                  </p>
                </div>
              </div>

              {/* Bill To & Dates Info */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-gray-100 pb-5 dark:border-white/10">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Billed To:
                  </h4>
                  <p className="font-bold text-gray-900 text-sm dark:text-white">
                    {invoice.customer_name}
                  </p>
                  {invoice.customer_tin && (
                    <p className="text-gray-500">TIN: {invoice.customer_tin}</p>
                  )}
                  <p className="text-gray-500">{invoice.district} · {invoice.address}</p>
                  <p className="text-gray-500">{invoice.customer_phone}</p>
                  <p className="text-gray-500">{invoice.customer_email}</p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div>
                    <span className="text-gray-400">Issue Date: </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{invoice.issue_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment Due Date: </span>
                    <span className={`font-bold ${isOverdue ? "text-red-600" : "text-gray-800 dark:text-gray-200"}`}>
                      {invoice.due_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment Terms: </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Net 15 Days</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 font-bold uppercase text-gray-500 dark:bg-white/5 dark:border-white/10">
                    <tr>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2 text-center">Grade</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Amount (RWF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white">
                          {item.produce} {item.variety ? `(${item.variety})` : ""}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">
                          {item.grade ? `Grade ${item.grade}` : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">
                          {item.qty} {item.unit}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">
                          {item.price.toLocaleString()} RWF
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-gray-900 dark:text-white">
                          {item.total.toLocaleString()} RWF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="mt-5 border-t border-gray-200 pt-4 dark:border-white/10 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {invoice.subtotal.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>VAT (18% RRA Tax):</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {invoice.tax.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-white/10 text-sm font-bold text-gray-900 dark:text-white">
                    <span>Total Amount Due:</span>
                    <span className="text-[#076935] dark:text-green-400">
                      {invoice.total.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions Box */}
              <div className="mt-6 rounded-xl border border-[#076935]/20 bg-[#076935]/5 p-4 dark:border-green-500/20 dark:bg-green-500/10">
                <h4 className="text-xs font-bold text-[#076935] dark:text-green-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} /> Official Payment Instructions
                </h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">MTN Mobile Money Merchant Code:</p>
                    <p className="text-[#076935] font-bold dark:text-green-400">
                      Dial *182*8*1*{invoice.momo_code || "492019"}#
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Bank Wire Transfer:</p>
                    <p>Bank of Kigali (BK) · Acc: 00049-082914-01</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Status Actions */}
          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/10 flex items-center gap-2">
            {!isPaid && (
              <button
                onClick={() => {
                  onMarkAsPaid?.(invoice.id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#076935] py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs"
              >
                <CheckCircle size={16} /> Mark Invoice as Paid
              </button>
            )}
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              <Share2 size={16} /> Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
