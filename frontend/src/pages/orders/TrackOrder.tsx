import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Bell,
  BellRing,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Leaf,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  FileText,
  HelpCircle,
  ShoppingBag
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import OrderTrackSkeleton from "../../components/skeletons/OrderTrackSkeleton";
import { apiGet } from "../../api/client";
import { toast } from "sonner";
import { usePageTitle } from "../../hooks/usePageTitle";

interface BackendOrder {
  id: number | string;
  user_id: number;
  customer_id?: number | null;
  order_date?: string;
  status?: string;
  total: number;
  order_source?: string;
  user_username?: string;
  user_full_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

interface BackendOrderItem {
  id: number;
  order_id: number | string;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string;
  product_image?: string | null;
  unit_code?: string;
  unit_name?: string;
  unit_symbol?: string;
}

interface DisplayOrderItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unit: string;
}

interface TrackedOrder {
  rawId: number | string;
  formattedId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  orderDate: string;
  orderTime: string;
  paymentMethod: string;
  paymentStatus: string;
  district: string;
  items: DisplayOrderItem[];
}

const STATUS_MAP: Record<string, TrackedOrder['status']> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatOrderDate(value?: string): { date: string; time: string } {
  if (!value) return { date: '—', time: '' };
  const parsed = new Date(value.replace(' ', 'T'));
  if (isNaN(parsed.getTime())) {
    const [d = '', t = ''] = value.split(' ');
    return { date: d, time: t.slice(0, 5) };
  }
  const date = parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = parsed.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return { date, time };
}

function parseInputId(input: string): string {
  const trimmed = input.trim();
  if (trimmed.toUpperCase().startsWith('KF-')) {
    return trimmed.slice(3).replace(/^0+/, '');
  }
  return trimmed;
}

export default function TrackOrder() {
  usePageTitle("track-order", "Track Your Order");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('orderId') || '';

  const [inputVal, setInputVal] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported on your browser.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Live Order Notifications Enabled! You will be alerted on status changes.');
    } else {
      setNotificationsEnabled(false);
      toast.info('Notification permission was not granted.');
    }
  };

  const notifyStatusChange = useCallback((orderId: string, oldStatus: string, newStatus: string) => {
    const msg = `Order #${orderId} status updated: ${oldStatus} -> ${newStatus.toUpperCase()}!`;
    toast.success(msg, {
      duration: 6000,
      description: `Your organic produce shipment is now marked as ${newStatus}.`,
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`KainaFresh Order Update: #${orderId}`, {
          body: `Status changed to ${newStatus}. Click to view tracking details.`,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.debug('Notification trigger error', err);
      }
    }
  }, []);

  const fetchOrder = useCallback(async (query: string, isSilentRefresh = false) => {
    const cleanId = parseInputId(query);
    if (!cleanId) return;

    if (!isSilentRefresh) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await apiGet<{ success: boolean; data: BackendOrder[] | BackendOrder }>(`/api/orders/track/${cleanId}`);
      let foundBackendOrder: BackendOrder | null = null;

      if (Array.isArray(res?.data)) {
        foundBackendOrder = res.data.find(
          (o) =>
            String(o.id) === cleanId ||
            `KF-${String(o.id).padStart(4, '0')}`.toLowerCase() === query.trim().toLowerCase() ||
            o.customer_phone?.includes(cleanId) ||
            o.customer_email?.toLowerCase().includes(query.trim().toLowerCase())
        ) || null;
      } else if (res?.data && typeof res.data === 'object') {
        foundBackendOrder = res.data;
      }

      if (!foundBackendOrder) {
        setError(`No order found matching "${query}". Please verify your Order Reference ID (e.g. KF-0001).`);
        setOrder(null);
        return;
      }

      const status = STATUS_MAP[(foundBackendOrder.status || '').toLowerCase()] || 'Pending';
      const { date, time } = formatOrderDate(foundBackendOrder.order_date);
      const formattedId = `KF-${String(foundBackendOrder.id).padStart(4, '0')}`;

      // Notify if status changed during polling/refresh
      if (lastStatusRef.current && lastStatusRef.current !== status && isSilentRefresh) {
        notifyStatusChange(formattedId, lastStatusRef.current, status);
      }
      lastStatusRef.current = status;

      const tracked: TrackedOrder = {
        rawId: foundBackendOrder.id,
        formattedId,
        customerName:
          [foundBackendOrder.customer_first_name, foundBackendOrder.customer_last_name].filter(Boolean).join(' ') ||
          foundBackendOrder.user_full_name ||
          foundBackendOrder.user_username ||
          `Customer #${foundBackendOrder.user_id}`,
        customerPhone: foundBackendOrder.customer_phone || '—',
        customerEmail: foundBackendOrder.customer_email || '—',
        status,
        totalAmount: Number(foundBackendOrder.total) || 0,
        orderDate: date,
        orderTime: time,
        paymentMethod: foundBackendOrder.order_source === 'externalorder' ? 'Cash on Delivery' : 'MTN Mobile Money',
        paymentStatus: status === 'Pending' || status === 'Processing' ? 'Pending' : 'Paid',
        district: 'Kigali (Central)',
        items: [],
      };

      setOrder(tracked);
      setError(null);

      // Fetch line items
      setItemsLoading(true);
      try {
        const itemsRes = await apiGet<{ success: boolean; data: BackendOrderItem[] }>(
          `/api/orders/${foundBackendOrder.id}/items`
        );
        const mappedItems: DisplayOrderItem[] = (itemsRes?.data || []).map((it) => ({
          id: it.id,
          name: it.product_name || `Product #${it.product_id}`,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unit_price) || 0,
          subtotal: Number(it.subtotal) || Number(it.quantity * it.unit_price) || 0,
          unit: it.unit_symbol || it.unit_code || 'kg',
        }));
        setOrder((prev) => (prev ? { ...prev, items: mappedItems } : prev));
      } catch (itemErr) {
        console.debug('Failed to fetch order items', itemErr);
      } finally {
        setItemsLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not fetch order tracking details.';
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [notifyStatusChange]);

  // Initial load if query ID exists
  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId, fetchOrder]);

  // Auto-polling for real-time status updates every 15s
  useEffect(() => {
    if (!autoRefresh || !inputVal.trim()) return;

    const interval = setInterval(() => {
      fetchOrder(inputVal, true);
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, inputVal, fetchOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      toast.error('Please enter an Order ID or Phone number');
      return;
    }
    setSearchParams({ id: inputVal.trim() });
    fetchOrder(inputVal.trim());
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Tracking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStepState = (stepIndex: number) => {
    if (!order) return 'upcoming';
    if (order.status === 'Cancelled') return 'cancelled';

    const orderSteps: Record<TrackedOrder['status'], number> = {
      Pending: 0,
      Processing: 1,
      Shipped: 2,
      Delivered: 3,
      Cancelled: -1,
    };

    const currentStep = orderSteps[order.status];
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#1F2937]">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* ── Page Header / Hero ── */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#076935]/10 text-[#076935] mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Truck size={14} className="text-[#076935]" /> Live Logistics Tracking
          </span>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#076935] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Track Your Fresh Order
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Real-time cold-chain visibility from organic farms in Rwanda directly to your doorstep.
          </p>
        </div>

        {/* ── Search Bar Card ── */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#076935]/15 shadow-sm max-w-2xl mx-auto mb-10 transition-all hover:shadow-md">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter Order ID (e.g. KF-0001 or 1)..."
                className="w-full pl-11 pr-4 py-3 bg-[#F4FAF7] border border-[#076935]/20 rounded-2xl text-sm font-medium outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 shrink-0"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Searching...
                </>
              ) : (
                <>
                  Track Order <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick sample chips if empty */}
          {!inputVal && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 flex-wrap">
              <span>Quick try:</span>
              {['KF-0001', 'KF-0002', 'KF-0003'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setInputVal(sample);
                    setSearchParams({ id: sample });
                    fetchOrder(sample);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#076935]/5 text-[#076935] font-semibold hover:bg-[#076935]/15 transition cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="max-w-2xl mx-auto mb-10 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-fade-in">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Order Search Failed</p>
              <p className="text-rose-600 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Skeleton Loading State ── */}
        {loading && <OrderTrackSkeleton />}

        {/* ── Main Order Tracking Display Card ── */}
        {!loading && order && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Top Info Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#076935]/15 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-[#076935]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Order #{order.formattedId}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : order.status === 'Shipped'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : order.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {order.status === 'Shipped' && <Truck size={13} />}
                      {order.status === 'Processing' && <RefreshCw size={13} className="animate-spin" />}
                      {order.status === 'Delivered' && <CheckCircle2 size={13} />}
                      {order.status === 'Cancelled' && <XCircle size={13} />}
                      {order.status === 'Pending' && <Clock size={13} />}
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={13} className="text-[#F39927]" /> Placed on {order.orderDate} at {order.orderTime}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-[#F39927]" /> {order.district}
                    </span>
                  </p>
                </div>

                {/* Quick Action Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white text-xs font-semibold text-gray-700 transition cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied Link' : 'Copy Link'}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white text-xs font-semibold text-gray-700 transition cursor-pointer shadow-2xs"
                  >
                    <Printer size={14} /> Print Receipt
                  </button>

                  <button
                    onClick={requestNotificationPermission}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      notificationsEnabled
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-[#F39927]/10 border-[#F39927]/30 text-[#D97706] hover:bg-[#F39927]/20'
                    }`}
                  >
                    {notificationsEnabled ? <BellRing size={14} /> : <Bell size={14} />}
                    {notificationsEnabled ? 'Notifications On' : 'Alert Me on Updates'}
                  </button>
                </div>
              </div>

              {/* ── 4-Step Interactive Stepper Timeline ── */}
              <div className="pt-8 pb-4">
                <div className="relative flex items-center justify-between">
                  {/* Connecting background bar */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 -translate-y-1/2 z-0" />
                  
                  {/* Active progress fill */}
                  <div
                    className="absolute top-6 left-6 h-1 bg-[#076935] -translate-y-1/2 z-0 transition-all duration-700"
                    style={{
                      width:
                        order.status === 'Pending'
                          ? '0%'
                          : order.status === 'Processing'
                          ? '33%'
                          : order.status === 'Shipped'
                          ? '66%'
                          : order.status === 'Delivered'
                          ? '100%'
                          : '0%',
                    }}
                  />

                  {/* Step Nodes */}
                  {[
                    { title: 'Order Placed', desc: 'Received & Confirmed', icon: <FileText size={18} /> },
                    { title: 'Processing', desc: 'Harvest & Cold Storage', icon: <Package size={18} /> },
                    { title: 'Shipped', desc: 'Temperature Transit', icon: <Truck size={18} /> },
                    { title: 'Delivered', desc: 'Handed to Recipient', icon: <CheckCircle2 size={18} /> },
                  ].map((step, idx) => {
                    const state = getStepState(idx);
                    return (
                      <div key={step.title} className="relative z-10 flex flex-col items-center group text-center max-w-[120px]">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                            state === 'completed'
                              ? 'bg-[#076935] text-white shadow-md scale-105'
                              : state === 'current'
                              ? 'bg-[#F39927] text-white shadow-lg ring-4 ring-[#F39927]/20 scale-110'
                              : state === 'cancelled'
                              ? 'bg-rose-500 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-400'
                          }`}
                        >
                          {state === 'completed' ? <Check size={20} /> : step.icon}
                        </div>
                        <span
                          className={`mt-3 text-xs font-bold leading-tight ${
                            state === 'current'
                              ? 'text-[#076935]'
                              : state === 'completed'
                              ? 'text-gray-800'
                              : 'text-gray-400'
                          }`}
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {step.title}
                        </span>
                        <span className="text-[11px] text-gray-400 hidden sm:block mt-0.5">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-[#F4FAF7] border border-[#076935]/15 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#076935]/10 text-[#076935] flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                      Cold-Chain Guarantee Active
                    </p>
                    <p className="text-xs text-gray-500">
                      Your produce is maintained between 4°C - 8°C throughout transport.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchOrder(inputVal)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#076935]/20 text-xs font-bold text-[#076935] hover:bg-[#076935]/5 transition cursor-pointer"
                  >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Status
                  </button>

                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded text-[#076935] focus:ring-[#076935]"
                    />
                    Live Polling (15s)
                  </label>
                </div>
              </div>
            </div>

            {/* ── Order Details & Line Items Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Line Items Table (2 Cols) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#076935]/15 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <h3
                    className="text-lg font-bold text-gray-900 flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <ShoppingBag size={18} className="text-[#076935]" /> Ordered Organic Items
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    {order.items.length} produce {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {itemsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="skeleton-shimmer h-12 w-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="skeleton-shimmer h-4 w-36 rounded-md" />
                          <div className="skeleton-shimmer h-3 w-20 rounded-md" />
                        </div>
                        <div className="skeleton-shimmer h-5 w-16 rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : order.items.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <Leaf size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold">Standard Organic Harvest Parcel</p>
                    <p className="text-xs text-gray-400">Line item breakdown loaded upon dispatch.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          <th className="py-2.5 px-2">Item Name</th>
                          <th className="py-2.5 px-2 text-center">Qty</th>
                          <th className="py-2.5 px-2 text-right">Unit Price</th>
                          <th className="py-2.5 px-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {order.items.map((item) => (
                          <tr key={item.id} className="hover:bg-[#F4FAF7]/40 transition">
                            <td className="py-3 px-2 font-semibold text-gray-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#076935]" />
                              {item.name}
                            </td>
                            <td className="py-3 px-2 text-center text-xs font-bold text-gray-600">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-3 px-2 text-right text-xs text-gray-500">
                              RWF {item.unitPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-[#076935]">
                              RWF {item.subtotal.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Subtotal summary breakdown */}
                <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Items Subtotal</span>
                    <span>RWF {order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Cold-Chain Delivery</span>
                    <span className="text-emerald-700 font-medium">Included / Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-100 pt-3">
                    <span style={{ fontFamily: 'var(--font-heading)' }}>Total Paid</span>
                    <span className="text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                      RWF {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer & Delivery Info (1 Col) */}
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-white p-6 rounded-3xl border border-[#076935]/15 shadow-sm">
                  <h3
                    className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Recipient Details
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#076935]/10 text-[#076935] flex items-center justify-center shrink-0 mt-0.5">
                        <Leaf size={15} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Customer Name</span>
                        <strong className="text-gray-800 font-bold">{order.customerName}</strong>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F39927]/15 text-[#F39927] flex items-center justify-center shrink-0 mt-0.5">
                        <Phone size={15} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Contact Phone</span>
                        <span className="text-gray-800 font-medium">{order.customerPhone}</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#076935]/10 text-[#076935] flex items-center justify-center shrink-0 mt-0.5">
                        <Mail size={15} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Email Address</span>
                        <span className="text-gray-800 font-medium">{order.customerEmail}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Payment Info */}
                <div className="bg-white p-6 rounded-3xl border border-[#076935]/15 shadow-sm">
                  <h3
                    className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Payment Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <CreditCard size={14} className="text-[#076935]" /> Method
                      </span>
                      <span className="font-bold text-gray-800 text-xs">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Payment Status</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-[#F4FAF7] p-5 rounded-3xl border border-[#076935]/20 text-center">
                  <HelpCircle size={24} className="mx-auto mb-2 text-[#076935]" />
                  <h4 className="font-bold text-sm text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Need Help With Your Order?
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 mb-4">
                    Our customer support team is on standby to assist with delivery instructions or inquiries.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-1.5 w-full bg-[#076935] hover:bg-[#055028] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Contact Support Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
