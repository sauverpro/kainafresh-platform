import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  User,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  useCartStore,
  selectCartCount,
  selectCartSubtotal,
} from "../../store/useCartStore";
import {
  resolveOrderUserId,
  createCustomer,
  createOrder,
  type CustomerData,
} from "../../services/checkout";
import { getCurrentUser, isAuthenticated } from "../../api/client";
import productPlaceholder from "../../assets/images/placeholder.png";

export default function CheckoutPage() {
  usePageTitle("checkout", "Checkout");
  const navigate = useNavigate();
  const { items, clear } = useCartStore();

  const loggedIn = isAuthenticated();
  const initial = useMemo<{ fullName: string; email: string; phone: string }>(() => {
    if (loggedIn) {
      const user = getCurrentUser();
      return {
        fullName: user?.full_name ?? "",
        email: user?.email ?? "",
        phone: user?.phone_number ?? "",
      };
    }
    return { fullName: "", email: "", phone: "" };
  }, [loggedIn]);

  const [contact, setContact] = useState({ ...initial });
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  const subtotal = selectCartSubtotal(items);
  const count = selectCartCount(items);

  useEffect(() => {
    if (items.length === 0 && !placing) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, placing, navigate]);

  const updateContact = (
    key: keyof typeof contact,
    value: string,
  ) => setContact((prev) => ({ ...prev, [key]: value }));

  const handlePlaceOrder = async () => {
    const fullName = contact.fullName.trim();
    const email = contact.email.trim();
    const phone = contact.phone.trim();

    if (items.length === 0) return;
    if (!fullName) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phone) {
      toast.error("Please enter your phone number.");
      return;
    }

    setPlacing(true);
    try {
      // 1. Resolve / create the user associated with this order.
      const { userId } = await resolveOrderUserId(email, fullName, phone);

      // 2. Create the customer record.
      const [first, ...rest] = fullName.split(/\s+/);
      const customerData: CustomerData = {
        first_name: first || "",
        last_name: rest.join(" ") || "",
        phone,
        email,
        address: address.trim() || undefined,
      };
      const customerId = await createCustomer(customerData);

      // 3. Create the order + items.
      const order = await createOrder(userId, subtotal, customerId, items);

      clear();
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to place order.");
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-25">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6">
        <button
          onClick={() => navigate("/cart")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          <ArrowLeft size={16} /> Back to cart
        </button>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          Checkout
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Complete your details below to place your order.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: form */}
          <div className="flex flex-col gap-6">
            <ContactForm
              loggedIn={loggedIn}
              contact={contact}
              onChange={updateContact}
            />
            <DeliveryForm address={address} onChange={setAddress} />
            <button
              onClick={handlePlaceOrder}
              disabled={placing || items.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Placing order...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Place Order · RWF{" "}
                  {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </>
              )}
            </button>
          </div>

          {/* Right: summary */}
          <CheckoutSummary items={items} count={count} subtotal={subtotal} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-gray-400";

function ContactForm({
  loggedIn,
  contact,
  onChange,
}: {
  loggedIn: boolean;
  contact: { fullName: string; email: string; phone: string };
  onChange: (key: "fullName" | "email" | "phone", value: string) => void;
}) {
  return (
    <SectionCard
      icon={<User size={18} className="text-brand-600" />}
      title="Contact information"
    >
      {loggedIn ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <span>
            We've filled your details from your account. You can update them
            before placing the order.
          </span>
        </div>
      ) : (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
          <UserPlus size={16} className="mt-0.5 shrink-0" />
          <span>
            Enter your details to create an account and link this order to you.
            You'll receive order updates by email.
          </span>
        </div>
      )}

      <label className="block text-sm font-semibold text-gray-700">
        Full name
        <input
          type="text"
          value={contact.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="e.g. Jean Mugisha"
          className={inputClass}
        />
      </label>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">
          Email
          <input
            type="email"
            value={contact.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Phone
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+250 7xx xxx xxx"
            className={inputClass}
          />
        </label>
      </div>
    </SectionCard>
  );
}

function DeliveryForm({
  address,
  onChange,
}: {
  address: string;
  onChange: (value: string) => void;
}) {
  return (
    <SectionCard icon={<ShieldCheck size={18} className="text-brand-600" />} title="Delivery details">
      {!isAuthenticated() && (
        <Link
          to="/signup"
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-brand-25 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          <UserPlus size={15} />
          Create an account instead
        </Link>
      )}
      <label className="block text-sm font-semibold text-gray-700">
        Delivery address
        <textarea
          value={address}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="e.g. KN 5 Rd, Kigali"
          className={inputClass}
        />
      </label>
    </SectionCard>
  );
}

function CheckoutSummary({
  items,
  count,
  subtotal,
}: {
  items: { product: { id: number | string; name: string; price: number; product_image?: string | null }; quantity: number }[];
  count: number;
  subtotal: number;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Order Summary
        <span className="ml-2 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
          {count} item{count === 1 ? "" : "s"}
        </span>
      </h2>

      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.product.id}
            className="flex items-center gap-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={item.product.product_image ?? productPlaceholder}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute -right-0 -top-0 flex h-5 min-w-[20px] items-center justify-center rounded-bl-lg bg-brand-700 px-1 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {item.product.name}
              </p>
              <p className="text-xs text-gray-500">
                RWF {Number(item.product.price).toLocaleString()} × {item.quantity}
              </p>
            </div>
            <span className="text-sm font-bold text-gray-900">
              RWF{" "}
              {(
                Number(item.product.price) * item.quantity
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <dt>Subtotal</dt>
          <dd>RWF {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <dt>Delivery</dt>
          <dd className="text-brand-700">Free</dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
          <dt>Total</dt>
          <dd>RWF {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>
        </div>
      </dl>
    </aside>
  );
}
