import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Eye,
  CreditCard,
  MapPin,
  X,
  Printer,
  RefreshCw,
  User,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  Boxes,
  Trash2,
} from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { apiGet, apiPut, apiDelete } from '../../../api/client';
import { toast } from 'sonner';
import StatusDropdown, {
  type StatusOption,
} from '../../../components/ui/StatusDropdown';
import TableSkeleton from '../../../components/ui/TableSkeleton';
import MetricCard from '../../../components/ui/MetricCard';
import Modal from '../../../components/ui/Modal';

/* ────────────────────────────────────────────────────────────
 * Backend shapes
 * ──────────────────────────────────────────────────────────── */
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
  orderId?: string;
}

/* ────────────────────────────────────────────────────────────
 * UI shape
 * ──────────────────────────────────────────────────────────── */
export interface OrderItem {
  id: string;
  backendId?: number | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  district: string;
  address: string;
  date: string;
  time: string;
  totalAmount: number;
  paymentMethod:
    | 'MTN Mobile Money'
    | 'Airtel Money'
    | 'Card Payment'
    | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  itemCount: number;
  totalWeightKg: number;
  items: {
    id: number;
    name: string;
    category: string;
    unitPrice: number;
    unit: string;
    quantity: number;
    image?: string;
  }[];
  deliveryFee: number;
  discount: number;
  notes?: string;
}

/* ────────────────────────────────────────────────────────────
 * Constants & helpers
 * ──────────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, OrderItem['status']> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'Pending', label: 'Pending', dotClassName: 'bg-amber-400' },
  { value: 'Processing', label: 'Processing', dotClassName: 'bg-blue-500' },
  { value: 'Shipped', label: 'Shipped', dotClassName: 'bg-purple-500' },
  { value: 'Delivered', label: 'Delivered', dotClassName: 'bg-emerald-500' },
  { value: 'Cancelled', label: 'Cancelled', dotClassName: 'bg-rose-500' },
];

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

function customerNameOf(o: BackendOrder): string {
  const first = o.customer_first_name?.trim();
  const last = o.customer_last_name?.trim();
  if (first) return [first, last].filter(Boolean).join(' ');
  if (o.user_full_name?.trim()) return o.user_full_name.trim();
  return o.user_username?.trim() || `User #${o.user_id}`;
}

function paymentLabelOf(source?: string): OrderItem['paymentMethod'] {
  return source === 'externalorder' ? 'Cash on Delivery' : 'MTN Mobile Money';
}

function referenceOf(o: BackendOrder): string {
  if (o.orderId && o.orderId.trim()) {
    return o.orderId.trim().toUpperCase();
  }
  return `KF-${String(o.id).padStart(4, '0')}`;
}

function mapBackendOrder(o: BackendOrder): OrderItem {
  const status = STATUS_MAP[(o.status || '').toLowerCase()] || 'Pending';
  const { date, time } = formatOrderDate(o.order_date);
  const customerName = customerNameOf(o);
  const reference = referenceOf(o);

  return {
    id: reference,
    backendId: o.id,
    customerName,
    customerEmail: o.customer_email || '',
    customerPhone: o.customer_phone || '',
    district: 'Kigali (Centre)',
    address: '—',
    date,
    time,
    totalAmount: Number(o.total) || 0,
    paymentMethod: paymentLabelOf(o.order_source),
    paymentStatus:
      status === 'Pending' || status === 'Processing' ? 'Pending' : 'Paid',
    status,
    itemCount: 0,
    totalWeightKg: 0,
    items: [],
    deliveryFee: 0,
    discount: 0,
  };
}

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */
export default function OrdersList() {
  usePageTitle('admin-orders', 'Orders Management');

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('All');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  /* ── Delete state ─────────────────────────────────────────── */
  const [deletingOrder, setDeletingOrder] = useState<OrderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ──────────────────────────────────────────────────────────
   * Load orders
   * ────────────────────────────────────────────────────────── */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiGet<{ success: boolean; data: BackendOrder[] }>(
        '/api/orders',
      );
      const items = (res.data ?? []).map(mapBackendOrder);
      const uniqueItemsMap = new Map<string, OrderItem>();
      items.forEach((item) => {
        if (!uniqueItemsMap.has(item.id)) {
          uniqueItemsMap.set(item.id, item);
        }
      });
      const uniqueItems = Array.from(uniqueItemsMap.values());
      setOrders(uniqueItems.length ? uniqueItems : []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load orders';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /* ──────────────────────────────────────────────────────────
   * Open order drawer + lazy load items
   * ────────────────────────────────────────────────────────── */
  const handleOpenOrder = useCallback(async (order: OrderItem) => {
    setSelectedOrder((prev) =>
      prev && prev.backendId === order.backendId
        ? { ...order, items: prev.items }
        : { ...order, items: [] },
    );
    setItemsLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: BackendOrderItem[] }>(
        `/api/orders/${order.backendId}/items`,
      );
      const items = (res.data ?? []).map((it) => ({
        id: it.id,
        name: it.product_name || `Product #${it.product_id}`,
        category: it.unit_name || 'Produce',
        unitPrice: Number(it.unit_price) || 0,
        unit: it.unit_symbol || it.unit_code || 'unit',
        quantity: Number(it.quantity) || 0,
      }));
      setSelectedOrder((prev) =>
        prev && prev.backendId === order.backendId
          ? { ...prev, items, itemCount: items.length }
          : prev,
      );
    } catch {
      setSelectedOrder((prev) =>
        prev && prev.backendId === order.backendId
          ? { ...prev, items: [], itemCount: 0 }
          : prev,
      );
    } finally {
      setItemsLoading(false);
    }
  }, []);

  /* ──────────────────────────────────────────────────────────
   * Stats
   * ────────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const processing = orders.filter((o) => o.status === 'Processing').length;
    const shipped = orders.filter((o) => o.status === 'Shipped').length;
    const totalVolumeRwf = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, pending, processing, shipped, totalVolumeRwf };
  }, [orders]);

  /* ──────────────────────────────────────────────────────────
   * Filtering
   * ────────────────────────────────────────────────────────── */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search) ||
        order.district.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' || order.status === selectedStatus;
      const matchesPayment =
        selectedPaymentMethod === 'All' ||
        order.paymentMethod === selectedPaymentMethod;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, selectedStatus, selectedPaymentMethod]);

  /* ──────────────────────────────────────────────────────────
   * Bulk selection
   * ────────────────────────────────────────────────────────── */
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((item) => item !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Status update
   * ────────────────────────────────────────────────────────── */
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderItem['status'],
  ) => {
    const target = orders.find((o) => o.id === orderId);
    const backendId = target?.backendId ?? orderId.replace('KF-', '');
    const backendStatus = newStatus.toLowerCase();

    const previousStatus = target?.status;

    if (target?.status === newStatus || updatingIds.includes(orderId)) return;

    setUpdatingIds((prev) => [...prev, orderId]);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }

    try {
      await apiPut<{ success: boolean }>(`/api/orders/${backendId}`, {
        status: backendStatus,
      });
      toast.success(`Order ${orderId} marked as ${newStatus}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update order status';
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: previousStatus ?? o.status }
            : o,
        ),
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? { ...prev, status: previousStatus ?? prev.status }
            : null,
        );
      }
      toast.error(`Failed to update status: ${message}`);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Delete order
   * ────────────────────────────────────────────────────────── */
  const openDeleteModal = (order: OrderItem) => {
    setDeletingOrder(order);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeletingOrder(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;

    const backendId = deletingOrder.backendId ?? deletingOrder.id;
    setDeleting(true);
    try {
      const response = await apiDelete<{
        success?: boolean;
        message?: string;
      }>(`/api/orders/${backendId}`);

      if (response && response.success === false) {
        throw new Error(response.message || 'Failed to delete order');
      }

      toast.success(`Order ${deletingOrder.id} deleted successfully.`);

      // Remove from list
      setOrders((prev) =>
        prev.filter((o) => o.id !== deletingOrder.id),
      );

      // If it was open in the drawer, close the drawer
      if (selectedOrder && selectedOrder.id === deletingOrder.id) {
        setSelectedOrder(null);
      }

      // Remove from bulk selection
      setSelectedOrders((prev) => prev.filter((id) => id !== deletingOrder.id));

      setDeletingOrder(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to delete order';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Status badge
   * ────────────────────────────────────────────────────────── */
  const renderFulfillmentBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F39927]/15 text-[#D97706] border border-[#F39927]/30">
            <Clock size={13} /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw size={13} className="animate-spin" /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck size={13} /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={13} /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} /> Cancelled
          </span>
        );
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Render
   * ────────────────────────────────────────────────────────── */
  return (
    <div
      className="space-y-8 font-sans pb-16"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#076935]/10 shadow-xs">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-wider text-[#F39927]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            E-Commerce Operations
          </span>
          <h1
            className="text-2xl md:text-3xl font-bold text-[#076935]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Orders Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor customer produce purchases, cold-chain fulfillment, and
            order dispatching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#F4FAF7] hover:bg-[#e4f3eb] text-[#076935] px-4 py-2.5 rounded-full text-xs md:text-sm font-bold border border-[#076935]/20 transition-all cursor-pointer disabled:opacity-60"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />{' '}
            Refresh List
          </button>

          <button
            onClick={() => alert('Exporting orders dataset to CSV...')}
            className="inline-flex items-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Could not load orders</p>
            <p className="text-rose-600">{loadError}</p>
            <button
              onClick={loadOrders}
              className="mt-2 inline-flex items-center gap-1.5 font-bold text-rose-700 underline-offset-2 hover:underline cursor-pointer border-0 bg-transparent"
            >
              <RefreshCw
                size={13}
                className={loading ? 'animate-spin' : ''}
              />{' '}
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="TOTAL REVENUE"
          value={
            stats.totalVolumeRwf > 0
              ? (stats.totalVolumeRwf / 1000000).toFixed(2) + 'M'
              : '0'
          }
          unit="RWF"
          subtext={
            stats.totalVolumeRwf > 0
              ? 'Total sales revenue'
              : 'No orders recorded'
          }
          icon={<ShoppingBag className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          badgeText="+14.0%"
          badgeColor="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
        <MetricCard
          label="PENDING ORDERS"
          value={stats.pending}
          unit="orders"
          subtext={
            stats.pending > 0 ? 'Awaiting fulfillment' : 'No pending orders'
          }
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-amber-50 text-amber-600"
          badgeText="Awaiting"
          badgeColor="bg-amber-50 text-amber-600 border-amber-200"
        />
        <MetricCard
          label="DISPATCH & TRANSIT"
          value={stats.processing + stats.shipped}
          unit="orders"
          subtext={
            stats.processing + stats.shipped > 0
              ? 'Active in transit'
              : 'No active dispatches'
          }
          icon={<Truck className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
          badgeText="In Transit"
          badgeColor="bg-blue-50 text-blue-600 border-blue-200"
        />
        <MetricCard
          label="FULFILLED ORDERS"
          value={stats.shipped}
          unit="orders"
          subtext={
            stats.shipped > 0
              ? 'Successfully delivered'
              : 'No fulfilled orders'
          }
          icon={<CheckCircle className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          badgeText="95% Rate"
          badgeColor="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-[#076935]/10 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by Order ID (#KF-9042), customer name, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-[#F4FAF7] border border-[#076935]/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#076935]/20 focus:border-[#076935] font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F4FAF7] px-4 py-2 rounded-full border border-[#076935]/15">
              <CreditCard size={15} className="text-[#076935]" />
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <option value="All">All Payment Methods</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Card Payment">Card Payment</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>

            {(search ||
              selectedStatus !== 'All' ||
              selectedPaymentMethod !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('All');
                  setSelectedPaymentMethod('All');
                }}
                className="text-xs font-bold text-[#F39927] hover:underline cursor-pointer border-0 bg-transparent px-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-100 pt-4">
          {['All', 'Pending', 'Processing', 'Shipped', 'Cancelled'].map(
            (statusKey) => {
              const count =
                statusKey === 'All'
                  ? orders.length
                  : orders.filter((o) => o.status === statusKey).length;

              return (
                <button
                  key={statusKey}
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    selectedStatus === statusKey
                      ? 'bg-[#076935] text-white shadow-xs'
                      : 'bg-[#F4FAF7] text-gray-700 hover:bg-[#e4f3eb] border border-[#076935]/10'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <span>{statusKey === 'All' ? 'All Orders' : statusKey}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedStatus === statusKey
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-[#076935] border border-[#076935]/15'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#076935]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="bg-[#F4FAF7] border-b border-[#076935]/10 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <th className="py-4 px-6 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrders.length === filteredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-[#076935] focus:ring-[#076935]"
                  />
                </th>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer & Location</th>
                <th className="py-4 px-6">Items & Weight</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <TableSkeleton columns={8} rows={5} />
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    <AlertCircle
                      size={36}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p
                      className="font-bold text-base text-gray-700 mb-1"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      No orders found
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No customer orders match your current search terms or
                      filter criteria. Try clearing search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F4FAF7]/50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenOrder(order)}
                  >
                    <td
                      className="py-4 px-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOne(order.id)}
                        className="rounded text-[#076935] focus:ring-[#076935]"
                      />
                    </td>
                    <td
                      className="py-4 px-6 font-bold text-[#076935]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {order.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#076935]/10 text-[#076935] font-bold text-xs flex items-center justify-center shrink-0">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <strong
                            className="font-bold text-gray-800 block text-sm leading-tight"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {order.customerName}
                          </strong>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-[#F39927]" />{' '}
                            {order.district}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {order.itemCount} Items ({order.totalWeightKg} kg)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <strong
                          className="font-bold text-base text-[#076935] block"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          RWF {order.totalAmount.toLocaleString()}
                        </strong>
                        <span className="text-[11px] font-semibold text-gray-500">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {renderFulfillmentBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      <div>{order.date}</div>
                      <div className="text-[11px] text-gray-400">
                        {order.time}
                      </div>
                    </td>
                    <td
                      className="py-4 px-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenOrder(order)}
                          className="p-2 rounded-full hover:bg-[#076935]/10 text-gray-500 hover:text-[#076935] transition-colors cursor-pointer border-0"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(order)}
                          className="p-2 rounded-full hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors cursor-pointer border-0"
                          title="Delete Order"
                        >
                          <Trash2 size={17} />
                        </button>
                        <StatusDropdown
                          value={order.status}
                          options={STATUS_OPTIONS}
                          onChange={(v) =>
                            handleUpdateStatus(
                              order.id,
                              v as OrderItem['status'],
                            )
                          }
                          loading={updatingIds.includes(order.id)}
                          ariaLabel={`Change status for order ${order.id}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>
            Showing{' '}
            <strong className="text-[#076935]">
              {filteredOrders.length}
            </strong>{' '}
            of <strong>{orders.length}</strong> orders
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[#076935] text-white font-bold cursor-pointer">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Order Detail Drawer ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1200] flex justify-end animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-2xl h-full overflow-y-auto p-8 shadow-2xl flex flex-col justify-between animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                <div>
                  <h2
                    className="text-2xl font-bold text-[#076935]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Order #{selectedOrder.id}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer border-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-[#F4FAF7] p-5 rounded-2xl border border-[#076935]/15 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase text-gray-500">
                    Current Status:
                  </span>
                  {renderFulfillmentBadge(selectedOrder.status)}
                </div>

                <div className="relative flex items-center justify-between pt-2">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-[#076935] -translate-y-1/2 z-0 transition-all duration-500"
                    style={{
                      width:
                        selectedOrder.status === 'Pending'
                          ? '25%'
                          : selectedOrder.status === 'Processing'
                            ? '50%'
                            : selectedOrder.status === 'Shipped'
                              ? '75%'
                              : selectedOrder.status === 'Delivered'
                                ? '100%'
                                : '0%',
                    }}
                  />

                  {['Placed', 'Processing', 'Shipped', 'Delivered'].map(
                    (step, idx) => (
                      <div
                        key={step}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <div
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 ${
                            idx === 0 ||
                            (idx === 1 &&
                              ['Processing', 'Shipped', 'Delivered'].includes(
                                selectedOrder.status,
                              )) ||
                            (idx === 2 &&
                              ['Shipped', 'Delivered'].includes(
                                selectedOrder.status,
                              )) ||
                            (idx === 3 && selectedOrder.status === 'Delivered')
                              ? 'bg-[#076935] text-white border-[#076935]'
                              : 'bg-white text-gray-400 border-gray-300'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[11px] font-bold text-gray-600 mt-1">
                          {step}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Customer / Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                  <span
                    className="font-bold text-gray-700 block mb-2 uppercase tracking-wider text-[10px]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Customer Contact
                  </span>
                  <div className="font-bold text-sm text-gray-800 mb-1 flex items-center gap-1.5">
                    <User size={14} className="text-[#076935]" />{' '}
                    {selectedOrder.customerName}
                  </div>
                  <div className="text-gray-500 flex items-center gap-1.5 mb-1">
                    <Phone size={13} className="text-[#F39927]" />{' '}
                    {selectedOrder.customerPhone}
                  </div>
                  <div className="text-gray-500 flex items-center gap-1.5">
                    <Mail size={13} className="text-[#076935]" />{' '}
                    {selectedOrder.customerEmail}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                  <span
                    className="font-bold text-gray-700 block mb-2 uppercase tracking-wider text-[10px]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Delivery Destination
                  </span>
                  <div className="font-bold text-sm text-[#076935] mb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#F39927]" />{' '}
                    {selectedOrder.district}
                  </div>
                  <div className="text-gray-600">{selectedOrder.address}</div>
                  {selectedOrder.notes && (
                    <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                      Note: {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Line items */}
              <div className="mb-6">
                <h4
                  className="text-sm font-bold text-gray-800 mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Purchased Produce Items
                </h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {itemsLoading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-6 text-center text-gray-500"
                          >
                            <Loader2
                              size={18}
                              className="mx-auto mb-2 animate-spin text-[#076935]"
                            />
                            Loading items...
                          </td>
                        </tr>
                      ) : selectedOrder.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-6 text-center text-gray-400"
                          >
                            <Boxes size={20} className="mx-auto mb-2" />
                            No items recorded for this order.
                          </td>
                        </tr>
                      ) : (
                        selectedOrder.items.map((prod) => (
                          <tr key={prod.id}>
                            <td className="p-3 font-semibold text-gray-800">
                              {prod.name}
                              <span className="block text-[10px] text-gray-400 font-normal">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">
                              RWF {prod.unitPrice.toLocaleString()} /{' '}
                              {prod.unit}
                            </td>
                            <td className="p-3 font-bold text-gray-800">
                              {prod.quantity}
                            </td>
                            <td className="p-3 text-right font-bold text-[#076935]">
                              RWF{' '}
                              {(prod.unitPrice * prod.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment summary */}
              <div className="bg-[#F4FAF7] p-4 rounded-2xl border border-[#076935]/15 text-xs space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-bold text-gray-800">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span>RWF {selectedOrder.deliveryFee.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Discount Coupon:</span>
                    <span>- RWF {selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#076935] pt-2 border-t border-[#076935]/20">
                  <span>Total Amount Paid:</span>
                  <span>RWF {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    alert(
                      `Printing official tax invoice for Order #${selectedOrder.id}...`,
                    )
                  }
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border-0"
                >
                  <Printer size={15} /> Print Invoice
                </button>
                <button
                  onClick={() => openDeleteModal(selectedOrder)}
                  className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={15} /> Delete Order
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status !== 'Delivered' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, 'Delivered')
                    }
                    className="inline-flex items-center gap-1.5 bg-[#076935] hover:bg-[#055028] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle size={15} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={Boolean(deletingOrder)}
        onClose={closeDeleteModal}
        size="sm"
        showCloseIcon={!deleting}
        title={
          <div className="flex items-center justify-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Trash2 size={18} />
            </div>
            <span>Delete Order</span>
          </div>
        }
      >
        {deletingOrder && (
          <div className="space-y-4 pt-1 text-sm">
            <p className="text-gray-600 leading-relaxed text-center">
              Are you sure you want to delete order{" "}
              <strong className="text-gray-900">#{deletingOrder.id}</strong>?
              This action cannot be undone.
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
              <p>
                <strong className="text-gray-700">Customer:</strong>{" "}
                {deletingOrder.customerName}
              </p>
              <p>
                <strong className="text-gray-700">Total:</strong>{" "}
                <span className="font-bold text-[#076935]">
                  RWF {deletingOrder.totalAmount.toLocaleString()}
                </span>
              </p>
              <p>
                <strong className="text-gray-700">Status:</strong>{" "}
                {deletingOrder.status}
              </p>
              <p>
                <strong className="text-gray-700">Placed:</strong>{" "}
                {deletingOrder.date} {deletingOrder.time}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                <X size={15} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 shadow-xs transition disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Delete Order
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}