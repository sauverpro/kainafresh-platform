import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Phone,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  MapPin,
  User,
  ArrowLeft,
} from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { useCart } from '../../context/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { apiPost } from '../../api/client';
import placeholderImg from '../../assets/images/placeholder.png';

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  district: string;
  address: string;
  notes: string;
  paymentMethod: 'momo' | 'airtel' | 'cod' | 'card';
}

interface OrderConfirmation {
  orderRef: string;
  date: string;
  form: CheckoutForm;
  items: Array<{ name: string; quantity: number; price: number; unit: string }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function Checkout() {
  usePageTitle('checkout', 'Checkout');

  const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    district: 'Kigali - Gasabo',
    address: '',
    notes: '',
    paymentMethod: 'momo',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const resolveImage = (path?: string) => {
    if (!path) return placeholderImg;
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg(null);
  };

  // const handleSubmitOrder = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!form.fullName.trim() || !form.phone.trim() || !form.district.trim()) {
  //     setErrorMsg('Please fill in your Full Name, Phone Number, and Delivery Address.');
  //     return;
  //   }

  //   if (cartItems.length === 0) {
  //     setErrorMsg('Your shopping basket is empty.');
  //     return;
  //   }

  //   setSubmitting(true);

  //   const randomRef = `KF-${Math.floor(10000 + Math.random() * 90000)}`;

  //   const orderPayload = {
  //     customer_name: form.fullName,
  //     email: form.email,
  //     phone: form.phone,
  //     district: form.district,
  //     address: form.address,
  //     notes: form.notes,
  //     payment_method: form.paymentMethod,
  //     total_amount: cartTotal,
  //     items: cartItems.map((item) => ({
  //       product_id: item.product.id,
  //       quantity: item.quantity,
  //       price: item.product.price,
  //     })),
  //   };

  //   try {
  //     await apiPost('/api/orders', orderPayload);
  //   } catch (err) {
  //     console.debug('Order POST endpoint notification:', err);
  //   }
  //   // create customer
  //   const customerPayload = {
  //     name: form.fullName,
  //     email: form.email,
  //     phone: form.phone,
  //   };
  //   setTimeout(() => {
  //     setOrderConfirmation({
  //       orderRef: randomRef,
  //       date: new Date().toLocaleDateString('en-US', {
  //         year: 'numeric',
  //         month: 'long',
  //         day: 'numeric',
  //         hour: '2-digit',
  //         minute: '2-digit',
  //       }),
  //       form,
  //       items: cartItems.map((item) => ({
  //         name: item.product.name,
  //         quantity: item.quantity,
  //         price: Number(item.product.price) || 0,
  //         unit: item.product.unit || 'kg',
  //       })),
  //       subtotal: cartSubtotal,
  //       deliveryFee,
  //       total: cartTotal,
  //     });

  //     clearCart();
  //     setSubmitting(false);
  //   }, 1200);
  // };
const handleSubmitOrder = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.fullName.trim() || !form.phone.trim() || !form.district.trim()) {
    setErrorMsg('Please fill in your Full Name, Phone Number, and Delivery Address.');
    return;
  }

  if (cartItems.length === 0) {
    setErrorMsg('Your shopping basket is empty.');
    return;
  }

  setSubmitting(true);
  setErrorMsg(null);

  try {
    // Step 1: Create Customer
    const customerPayload = {
      first_name: form.fullName.split(' ')[0] || '',
      last_name: form.fullName.split(' ').slice(1).join(' ') || '',
      phone: form.phone,
      email: form.email || '',
      address: `${form.address}, ${form.district}` || form.district,
    };

    const customerResponse = await apiPost('/api/customers', customerPayload);
    
    if (!customerResponse.success) {
      throw new Error(customerResponse.message || 'Failed to create customer');
    }

    const customerId = customerResponse.data?.id || customerResponse.id;

    // Step 2: Create Order
    const orderPayload = {
      user_id: 1, // You might want to get this from auth context
      customer_id: customerId,
      total: cartTotal,
      status: 'pending',
      order_source: 'ecommerce',
    };

    const orderResponse = await apiPost('/api/orders', orderPayload);
    
    if (!orderResponse.success) {
      throw new Error(orderResponse.message || 'Failed to create order');
    }

    const orderId = orderResponse.data?.id || orderResponse.id;

    // Step 3: Create Order Items
    const orderItemsPromises = cartItems.map(async (item) => {
      const itemPayload = {
        product_id: item.product.id,
        quantity: item.quantity,
      };

      const itemResponse = await apiPost(`/api/orders/${orderId}/items`, itemPayload);
      
      if (!itemResponse.success) {
        throw new Error(`Failed to add product ${item.product.name} to order`);
      }

      return itemResponse.data;
    });

    await Promise.all(orderItemsPromises);

    // Step 4: Generate Order Reference
    const randomRef = `KF-${String(orderId).padStart(5, '0')}`;

    // Step 5: Show Confirmation
    setOrderConfirmation({
      orderRef: randomRef,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      form,
      items: cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.product.price) || 0,
        unit: item.product.unit || 'kg',
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
    });

    clearCart();

  } catch (error) {
    console.error('Order creation failed:', error);
    setErrorMsg(error instanceof Error ? error.message : 'Failed to create your order. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <>
      <Navbar />

      <main className="pt-20 overflow-x-hidden font-sans bg-[#FFFDF9] min-h-screen" style={{ fontFamily: 'var(--font-body)' }}>
        {/* ── Order Confirmation Receipt Modal ── */}
        {orderConfirmation ? (
          <div className="py-16 px-6 md:px-[5%] max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#076935]/15 shadow-2xl text-center">
              <div className="w-24 h-24 rounded-full bg-[#076935]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={56} className="text-[#076935]" />
              </div>
              <h2 className="text-3xl font-bold text-[#076935] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Order Placed Successfully!
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Thank you for your order, <strong>{orderConfirmation.form.fullName}</strong>. We are preparing your farm-fresh produce.
              </p>

              <div className="bg-[#f4faf7] border border-dashed border-[#076935] rounded-2xl p-5 flex flex-col items-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F39927]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Order Reference Code
                </span>
                <strong className="text-3xl font-bold text-[#076935] tracking-wider my-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {orderConfirmation.orderRef}
                </strong>
                <span className="text-xs text-gray-500">Placed on {orderConfirmation.date}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                {/* Delivery Info */}
                <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-base text-[#076935] flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    <MapPin size={16} className="text-[#076935]" /> Delivery Address
                  </h3>
                  <p className="text-sm text-gray-800 font-semibold mb-1">{orderConfirmation.form.fullName}</p>
                  <p className="text-sm text-gray-600 mb-1">{orderConfirmation.form.address}</p>
                  <p className="text-sm text-gray-600 mb-1">{orderConfirmation.form.district}</p>
                  <p className="text-sm text-gray-600 mb-1">Phone: {orderConfirmation.form.phone}</p>
                  {orderConfirmation.form.email && <p className="text-sm text-gray-600">Email: {orderConfirmation.form.email}</p>}
                </div>

                {/* Payment Info */}
                <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-base text-[#076935] flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    <CreditCard size={16} className="text-[#076935]" /> Payment Details
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Method:{' '}
                    <strong>
                      {orderConfirmation.form.paymentMethod === 'momo'
                        ? 'MTN Mobile Money (*182#)'
                        : orderConfirmation.form.paymentMethod === 'airtel'
                        ? 'Airtel Money'
                        : orderConfirmation.form.paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : 'Credit / Debit Card'}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Status:{' '}
                    <span className="inline-block bg-[#F39927]/15 text-[#F39927] text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-heading)' }}>
                      Pending Delivery
                    </span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-700">
                    <Truck size={16} className="text-[#076935]" />
                    <span>Estimated Delivery: <strong>Tomorrow, 8:00 AM - 12:00 PM</strong></span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="text-left bg-[#FFFDF9] p-6 rounded-2xl border border-gray-100 mb-8">
                <h3 className="font-bold text-base text-[#076935] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Ordered Produce Summary
                </h3>
                <div className="flex flex-col gap-2.5 mb-4">
                  {orderConfirmation.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-800">
                      <span>
                        {item.name} × {item.quantity} {item.unit}
                      </span>
                      <strong className="text-[#076935]">RWF {(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>RWF {orderConfirmation.subtotal.toLocaleString()}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>RWF {orderConfirmation.deliveryFee.toLocaleString()}</span>
                  </div> */}
                  <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-dashed border-gray-200">
                    <span>Total Amount</span>
                    <strong className="text-xl text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                      RWF {orderConfirmation.total.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-8 py-3.5 rounded-full font-bold text-base transition-all shadow-md cursor-pointer"
                  onClick={() => navigate('/products')}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Continue Shopping <ArrowRight size={16} />
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[#076935] text-[#076935] hover:bg-[#076935] hover:text-white px-8 py-3.5 rounded-full font-bold text-base transition-all cursor-pointer"
                  onClick={() => navigate('/')}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Back to Home Page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Checkout Form & Summary Grid ── */}
            <section className="py-14 px-6 md:px-[5%] bg-gradient-to-br from-[#076935]/[0.06] to-[#F39927]/[0.06]">
              <div className="max-w-7xl mx-auto">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#076935] hover:text-[#F39927] transition-colors mb-4"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <ArrowLeft size={16} /> Back to Products Catalog
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-[#076935] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Checkout & Delivery Details
                </h1>
                <p className="text-gray-600 text-base">
                  Complete your shipping information and preferred payment method to receive your fresh harvest.
                </p>
              </div>
            </section>

            <section className="py-12 px-6 md:px-[5%] pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto items-start">
                {/* Left: Shipping & Payment Form */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium">
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitOrder} className="flex flex-col gap-6">
                    {/* Section 1: Customer Details */}
                    <div className="bg-white p-8 rounded-3xl border border-[#076935]/10 shadow-xs">
                      <h2 className="text-xl font-bold text-[#076935] flex items-center gap-2 mb-6 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-heading)' }}>
                        <User size={18} className="text-[#076935]" /> 1. Customer & Shipping Info
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="fullName" className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                            Full Name *
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="e.g. Jane Doe"
                            className="p-3.5 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 transition-all"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="phone" className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                            Phone Number (MoMo / WhatsApp) *
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+250 78X XXX XXX"
                            className="p-3.5 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mb-4">
                        <label htmlFor="email" className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                          Email Address (Optional)
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@company.com"
                          className="p-3.5 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="district" className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                            District / City *
                          </label>
                          <select
                            id="district"
                            name="district"
                            value={form.district}
                            onChange={handleChange}
                            className="p-3.5 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 transition-all cursor-pointer"
                          >
                            <option value="Kigali - Gasabo">Kigali - Gasabo</option>
                            <option value="Kigali - Kicukiro">Kigali - Kicukiro</option>
                            <option value="Kigali - Nyarugenge">Kigali - Nyarugenge</option>
                            <option value="Bugesera / Outer Kigali">Bugesera / Outer Kigali</option>
                            <option value="Other District (Upcountry)">Other District (Upcountry)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="address" className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                            Street / House / Landmark *
                          </label>
                          <input
                            id="address"
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="e.g. KG 123 St, House No. 4"
                            className="p-3.5 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 transition-all"
                            
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="notes" className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                          Special Delivery Instructions (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                          placeholder="e.g., Gate code, call before arrival, prefer morning delivery..."
                          rows={3}
                          className="p-3.5 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 transition-all resize-y"
                        />
                      </div>
                    </div>

                    {/* Section 2: Payment Method */}
                    <div className="bg-white p-8 rounded-3xl border border-[#076935]/10 shadow-xs">
                      <h2 className="text-xl font-bold text-[#076935] flex items-center gap-2 mb-6 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-heading)' }}>
                        <CreditCard size={18} className="text-[#076935]" /> 2. Payment Method
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* MoMo */}
                        <label
                          className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            form.paymentMethod === 'momo'
                              ? 'border-[#076935] bg-[#f4faf7]'
                              : 'border-gray-200 bg-white hover:border-[#076935]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="momo"
                            checked={form.paymentMethod === 'momo'}
                            onChange={handleChange}
                            className="mt-1 accent-[#076935]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                              <Phone size={18} className="text-[#F39927]" />
                              <strong>MTN Mobile Money</strong>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug m-0">Pay instantly using MTN MoMo prompt (*182*8*1*...#)</p>
                          </div>
                        </label>

                        {/* Airtel Money */}
                        <label
                          className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            form.paymentMethod === 'airtel'
                              ? 'border-[#076935] bg-[#f4faf7]'
                              : 'border-gray-200 bg-white hover:border-[#076935]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="airtel"
                            checked={form.paymentMethod === 'airtel'}
                            onChange={handleChange}
                            className="mt-1 accent-[#076935]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                              <Phone size={18} className="text-red-500" />
                              <strong>Airtel Money</strong>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug m-0">Pay via Airtel Money wallet code on delivery</p>
                          </div>
                        </label>

                        {/* Cash on Delivery */}
                        <label
                          className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            form.paymentMethod === 'cod'
                              ? 'border-[#076935] bg-[#f4faf7]'
                              : 'border-gray-200 bg-white hover:border-[#076935]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={form.paymentMethod === 'cod'}
                            onChange={handleChange}
                            className="mt-1 accent-[#076935]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                              <Truck size={18} className="text-[#076935]" />
                              <strong>Cash on Delivery</strong>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug m-0">Pay in cash directly to our rider upon inspect & receipt</p>
                          </div>
                        </label>

                        {/* Card */}
                        <label
                          className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            form.paymentMethod === 'card'
                              ? 'border-[#076935] bg-[#f4faf7]'
                              : 'border-gray-200 bg-white hover:border-[#076935]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={form.paymentMethod === 'card'}
                            onChange={handleChange}
                            className="mt-1 accent-[#076935]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                              <CreditCard size={18} className="text-blue-500" />
                              <strong>Credit / Debit Card</strong>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug m-0">Visa, MasterCard & International debit cards</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white font-bold text-lg py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      disabled={submitting || cartItems.length === 0}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {submitting ? (
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={18} /> Place Order Now — RWF {cartTotal.toLocaleString()}
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right: Order Summary Sidebar */}
                <div className="lg:col-span-5 sticky top-28">
                  <div className="bg-white p-8 rounded-3xl border border-[#076935]/10 shadow-xs">
                    <h2 className="text-xl font-bold text-[#076935] flex items-center gap-2 mb-6 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-heading)' }}>
                      <ShoppingBag size={18} className="text-[#076935]" /> Order Summary
                    </h2>

                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-4 text-sm">Your basket is currently empty.</p>
                        <Link to="/products" className="inline-flex items-center gap-1.5 bg-transparent border-2 border-[#076935] text-[#076935] px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#076935] hover:text-white transition-all">
                          Browse Products Catalog
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-3.5 max-h-72 overflow-y-auto mb-6 pr-1">
                          {cartItems.map(({ product, quantity }) => {
                            const itemImg = resolveImage(product.image || product.product_image);
                            const price = Number(product.price) || 0;

                            return (
                              <div key={product.id} className="flex items-center gap-3">
                                {/* <img src={itemImg} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-[#f4faf7] shrink-0" /> */}
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-sm text-gray-800 truncate block" style={{ fontFamily: 'var(--font-heading)' }}>
                                    {product.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Qty: {quantity} {product.unit || 'kg'}
                                  </span>
                                </div>
                                <strong className="font-bold text-sm text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                                  RWF {(price * quantity).toLocaleString()}
                                </strong>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mb-6 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>RWF {cartSubtotal.toLocaleString()}</span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>RWF {deliveryFee.toLocaleString()}</span>
                          </div> */}
                          <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-dashed border-gray-200">
                            <span>Total</span>
                            <strong className="text-xl text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                              RWF {cartTotal.toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex flex-col gap-3 pt-5 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <ShieldCheck size={16} className="text-[#076935]" />
                        <span>100% Organic Quality Guarantee</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <Truck size={16} className="text-[#076935]" />
                        <span>24-Hour Cold Chain Fresh Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
