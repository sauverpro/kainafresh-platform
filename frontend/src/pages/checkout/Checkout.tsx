import { useState, useEffect, useCallback } from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Phone,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ArrowLeft,
  MapPin,
  User,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Leaf,
  AlertCircle,
  Loader2,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Leaf,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useCart } from "../../context/CartContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { apiPost, setToken } from "../../api/client";
import { apiPost, setToken } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import placeholderImg from "../../assets/images/placeholder.png";

// ── Types ────────────────────────────────────────────────────────────────────

interface DeliveryForm {
// ── Types ────────────────────────────────────────────────────────────────────

interface DeliveryForm {
  fullName: string;
  phone: string;
  email: string;
  email: string;
  district: string;
  address: string;
  notes: string;
  paymentMethod: "momo" | "airtel" | "cod" | "card";
}

interface OrderConfirmation {
  orderRef: string;
  date: string;
  form: DeliveryForm;
  form: DeliveryForm;
  items: Array<{ name: string; quantity: number; price: number; unit: string }>;
  subtotal: number;
  total: number;
}

// ── Auth Gate Modal ───────────────────────────────────────────────────────────

interface AuthGateModalProps {
  onClose: () => void;
  onAuthSuccess: () => void;
}

function AuthGateModal({ onClose, onAuthSuccess }: AuthGateModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("signup");

  // ── Login State ──────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email.trim()) return setLoginError("Email is required.");
    if (!loginForm.password) return setLoginError("Password is required.");
    setLoginLoading(true);
    setLoginError("");
    try {
      const data = await apiPost<{
        success: boolean;
        data: {
          token: string;
          user: { id: number; username: string; email: string; role: string; full_name?: string; phone_number?: string };
        };
      }>("/api/auth/login", { email: loginForm.email.trim(), password: loginForm.password });
      setToken(data.data.token);
      setUser(data.data.user);
      onAuthSuccess();
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup State ─────────────────────────────────────────────────────────
  const [signupStep, setSignupStep] = useState(1);
  const [signupForm, setSignupForm] = useState({
    full_name: "", username: "", email: "", phone_number: "", password: "", confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupServerError, setSignupServerError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupErrors((p) => ({ ...p, [name]: "" }));
    setSignupServerError("");
    setSignupForm((p) => ({ ...p, [name]: value }));
  };

  const validateSignupStep = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (signupStep === 1) {
      if (!signupForm.full_name.trim()) errs.full_name = "Full name is required.";
      if (!signupForm.username.trim()) errs.username = "Username is required.";
      else if (signupForm.username.includes(" ")) errs.username = "No spaces allowed.";
    }
    if (signupStep === 2) {
      if (!signupForm.email.trim()) errs.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = "Enter a valid email address.";
      if (!signupForm.phone_number.trim()) errs.phone_number = "Phone number is required.";
    }
    if (signupStep === 3) {
      if (!signupForm.password) errs.password = "Password is required.";
      else if (signupForm.password.length < 8) errs.password = "At least 8 characters required.";
      if (!signupForm.confirmPassword) errs.confirmPassword = "Please confirm your password.";
      else if (signupForm.password !== signupForm.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  };

  const goNextSignup = () => {
    const errs = validateSignupStep();
    if (Object.keys(errs).length > 0) return setSignupErrors(errs);
    setSignupStep((s) => s + 1);
  };

  const getPasswordStrength = (pw: string): number => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const pwStrength = getPasswordStrength(signupForm.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateSignupStep();
    if (Object.keys(errs).length > 0) return setSignupErrors(errs);
    setSignupLoading(true);
    setSignupServerError("");
    try {
      await apiPost("/api/auth/register", {
        full_name: signupForm.full_name.trim(),
        username: signupForm.username.trim(),
        email: signupForm.email.trim(),
        phone_number: signupForm.phone_number.trim(),
        password: signupForm.password,
      });
      // Auto-login after registration
      setSignupLoading(false);
      setAutoLoggingIn(true);
      const loginData = await apiPost<{
        data: { token: string; user?: { id: number; username?: string; email?: string; role?: string; full_name?: string; phone_number?: string } };
      }>("/api/auth/login", { email: signupForm.email.trim(), password: signupForm.password });
      setToken(loginData.data.token);
      if (loginData.data.user) setUser(loginData.data.user);
      // Brief pause to show the "Logging in" screen
      await new Promise((r) => setTimeout(r, 1200));
      setAutoLoggingIn(false);
      onAuthSuccess();
    } catch (err: unknown) {
      setSignupLoading(false);
      setAutoLoggingIn(false);
      setSignupServerError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    }
  };

  // ── Auto-Login Loading Screen ────────────────────────────────────────────
  if (autoLoggingIn) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-xs w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-[#076935]/10 flex items-center justify-center">
            <Loader2 size={36} className="text-[#076935] animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-bold text-[#076935] text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              Logging you in…
            </p>
            <p className="text-gray-500 text-sm mt-1">Welcome aboard! Preparing your order.</p>
          </div>
          {/* Animated progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#076935] to-[#F39927] rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#076935] to-[#055028] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer border-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[#F39927] text-xs font-bold uppercase tracking-wider">KainaFresh Checkout</p>
              <h2 className="font-bold text-xl leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Account Required
              </h2>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Create an account or sign in to place your order. Your cart items are saved!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer border-0 ${
              tab === "signup"
                ? "text-[#076935] border-b-2 border-[#076935] bg-[#f4faf7]"
                : "text-gray-500 hover:text-gray-700 bg-white"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Create Account
          </button>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer border-0 ${
              tab === "login"
                ? "text-[#076935] border-b-2 border-[#076935] bg-[#f4faf7]"
                : "text-gray-500 hover:text-gray-700 bg-white"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sign In
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* ── LOGIN TAB ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {loginError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {loginError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => { setLoginError(""); setLoginForm((p) => ({ ...p, email: e.target.value })); }}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showLoginPw ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => { setLoginError(""); setLoginForm((p) => ({ ...p, password: e.target.value })); }}
                    placeholder="Your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowLoginPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                    {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer border-0"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <><Leaf size={15} /> Sign In & Continue</>}
              </button>
              <p className="text-center text-xs text-gray-500">
                No account yet?{" "}
                <button type="button" onClick={() => setTab("signup")} className="text-[#076935] font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP TAB ── */}
          {tab === "signup" && (
            <div className="flex flex-col gap-4">
              {/* Progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-[#076935]">Step {signupStep} of 3</span>
                  <span>{signupStep === 1 ? "Your name" : signupStep === 2 ? "Contact info" : "Set password"}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#076935] to-[#F39927] rounded-full transition-all duration-500"
                    style={{ width: `${(signupStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {signupServerError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {signupServerError}
                </div>
              )}

              {/* Step 1: Name & Username */}
              {signupStep === 1 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text" name="full_name" value={signupForm.full_name}
                        onChange={handleSignupChange} placeholder="Your full name" autoFocus
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.full_name ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.full_name && <span className="text-xs text-red-500">{signupErrors.full_name}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Username</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text" name="username" value={signupForm.username}
                        onChange={handleSignupChange} placeholder="Choose a username"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.username ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.username && <span className="text-xs text-red-500">{signupErrors.username}</span>}
                  </div>
                  <button type="button" onClick={goNextSignup}
                    className="w-full flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer border-0"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* Step 2: Email & Phone */}
              {signupStep === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" name="email" value={signupForm.email}
                        onChange={handleSignupChange} placeholder="your@email.com" autoFocus
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.email ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.email && <span className="text-xs text-red-500">{signupErrors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel" name="phone_number" value={signupForm.phone_number}
                        onChange={handleSignupChange} placeholder="+250 78X XXX XXX"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.phone_number ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.phone_number && <span className="text-xs text-red-500">{signupErrors.phone_number}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSignupStep(1)}
                      className="flex items-center justify-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer bg-white"
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button type="button" onClick={goNextSignup}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer border-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {signupStep === 3 && (
                <form onSubmit={handleSignup} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Create Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showSignupPw ? "text" : "password"} name="password" value={signupForm.password}
                        onChange={handleSignupChange} placeholder="At least 8 characters" autoFocus autoComplete="new-password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.password ? "border-red-400" : "border-gray-200"}`}
                      />
                      <button type="button" onClick={() => setShowSignupPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                        {showSignupPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signupForm.password && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength ? strengthColors[pwStrength] : "bg-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{strengthLabel[pwStrength]}</span>
                      </div>
                    )}
                    {signupErrors.password && <span className="text-xs text-red-500">{signupErrors.password}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPw ? "text" : "password"} name="confirmPassword" value={signupForm.confirmPassword}
                        onChange={handleSignupChange} placeholder="Repeat your password" autoComplete="new-password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && <span className="text-xs text-red-500">{signupErrors.confirmPassword}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSignupStep(2)}
                      className="flex items-center justify-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer bg-white"
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button type="submit" disabled={signupLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer border-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {signupLoading ? <Loader2 size={16} className="animate-spin" /> : <><Leaf size={15} /> Join KainaFresh</>}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-center text-xs text-gray-500 mt-1">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-[#076935] font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                  Sign in instead
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Checkout Page ─────────────────────────────────────────────────────────────

// ── Auth Gate Modal ───────────────────────────────────────────────────────────

interface AuthGateModalProps {
  onClose: () => void;
  onAuthSuccess: () => void;
}

function AuthGateModal({ onClose, onAuthSuccess }: AuthGateModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("signup");

  // ── Login State ──────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email.trim()) return setLoginError("Email is required.");
    if (!loginForm.password) return setLoginError("Password is required.");
    setLoginLoading(true);
    setLoginError("");
    try {
      const data = await apiPost<{
        success: boolean;
        data: {
          token: string;
          user: { id: number; username: string; email: string; role: string; full_name?: string; phone_number?: string };
        };
      }>("/api/auth/login", { email: loginForm.email.trim(), password: loginForm.password });
      setToken(data.data.token);
      setUser(data.data.user);
      onAuthSuccess();
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup State ─────────────────────────────────────────────────────────
  const [signupStep, setSignupStep] = useState(1);
  const [signupForm, setSignupForm] = useState({
    full_name: "", username: "", email: "", phone_number: "", password: "", confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupServerError, setSignupServerError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupErrors((p) => ({ ...p, [name]: "" }));
    setSignupServerError("");
    setSignupForm((p) => ({ ...p, [name]: value }));
  };

  const validateSignupStep = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (signupStep === 1) {
      if (!signupForm.full_name.trim()) errs.full_name = "Full name is required.";
      if (!signupForm.username.trim()) errs.username = "Username is required.";
      else if (signupForm.username.includes(" ")) errs.username = "No spaces allowed.";
    }
    if (signupStep === 2) {
      if (!signupForm.email.trim()) errs.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = "Enter a valid email address.";
      if (!signupForm.phone_number.trim()) errs.phone_number = "Phone number is required.";
    }
    if (signupStep === 3) {
      if (!signupForm.password) errs.password = "Password is required.";
      else if (signupForm.password.length < 8) errs.password = "At least 8 characters required.";
      if (!signupForm.confirmPassword) errs.confirmPassword = "Please confirm your password.";
      else if (signupForm.password !== signupForm.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  };

  const goNextSignup = () => {
    const errs = validateSignupStep();
    if (Object.keys(errs).length > 0) return setSignupErrors(errs);
    setSignupStep((s) => s + 1);
  };

  const getPasswordStrength = (pw: string): number => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const pwStrength = getPasswordStrength(signupForm.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateSignupStep();
    if (Object.keys(errs).length > 0) return setSignupErrors(errs);
    setSignupLoading(true);
    setSignupServerError("");
    try {
      await apiPost("/api/auth/register", {
        full_name: signupForm.full_name.trim(),
        username: signupForm.username.trim(),
        email: signupForm.email.trim(),
        phone_number: signupForm.phone_number.trim(),
        password: signupForm.password,
      });
      // Auto-login after registration
      setSignupLoading(false);
      setAutoLoggingIn(true);
      const loginData = await apiPost<{
        data: { token: string; user?: { id: number; username?: string; email?: string; role?: string; full_name?: string; phone_number?: string } };
      }>("/api/auth/login", { email: signupForm.email.trim(), password: signupForm.password });
      setToken(loginData.data.token);
      if (loginData.data.user) setUser(loginData.data.user);
      // Brief pause to show the "Logging in" screen
      await new Promise((r) => setTimeout(r, 1200));
      setAutoLoggingIn(false);
      onAuthSuccess();
    } catch (err: unknown) {
      setSignupLoading(false);
      setAutoLoggingIn(false);
      setSignupServerError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    }
  };

  // ── Auto-Login Loading Screen ────────────────────────────────────────────
  if (autoLoggingIn) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-xs w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-[#076935]/10 flex items-center justify-center">
            <Loader2 size={36} className="text-[#076935] animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-bold text-[#076935] text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              Logging you in…
            </p>
            <p className="text-gray-500 text-sm mt-1">Welcome aboard! Preparing your order.</p>
          </div>
          {/* Animated progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#076935] to-[#F39927] rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#076935] to-[#055028] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer border-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[#F39927] text-xs font-bold uppercase tracking-wider">KainaFresh Checkout</p>
              <h2 className="font-bold text-xl leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Account Required
              </h2>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Create an account or sign in to place your order. Your cart items are saved!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer border-0 ${
              tab === "signup"
                ? "text-[#076935] border-b-2 border-[#076935] bg-[#f4faf7]"
                : "text-gray-500 hover:text-gray-700 bg-white"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Create Account
          </button>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer border-0 ${
              tab === "login"
                ? "text-[#076935] border-b-2 border-[#076935] bg-[#f4faf7]"
                : "text-gray-500 hover:text-gray-700 bg-white"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sign In
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* ── LOGIN TAB ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {loginError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {loginError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => { setLoginError(""); setLoginForm((p) => ({ ...p, email: e.target.value })); }}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showLoginPw ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => { setLoginError(""); setLoginForm((p) => ({ ...p, password: e.target.value })); }}
                    placeholder="Your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowLoginPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                    {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer border-0"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <><Leaf size={15} /> Sign In & Continue</>}
              </button>
              <p className="text-center text-xs text-gray-500">
                No account yet?{" "}
                <button type="button" onClick={() => setTab("signup")} className="text-[#076935] font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP TAB ── */}
          {tab === "signup" && (
            <div className="flex flex-col gap-4">
              {/* Progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-[#076935]">Step {signupStep} of 3</span>
                  <span>{signupStep === 1 ? "Your name" : signupStep === 2 ? "Contact info" : "Set password"}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#076935] to-[#F39927] rounded-full transition-all duration-500"
                    style={{ width: `${(signupStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {signupServerError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {signupServerError}
                </div>
              )}

              {/* Step 1: Name & Username */}
              {signupStep === 1 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text" name="full_name" value={signupForm.full_name}
                        onChange={handleSignupChange} placeholder="Your full name" autoFocus
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.full_name ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.full_name && <span className="text-xs text-red-500">{signupErrors.full_name}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Username</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text" name="username" value={signupForm.username}
                        onChange={handleSignupChange} placeholder="Choose a username"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.username ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.username && <span className="text-xs text-red-500">{signupErrors.username}</span>}
                  </div>
                  <button type="button" onClick={goNextSignup}
                    className="w-full flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer border-0"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* Step 2: Email & Phone */}
              {signupStep === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" name="email" value={signupForm.email}
                        onChange={handleSignupChange} placeholder="your@email.com" autoFocus
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.email ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.email && <span className="text-xs text-red-500">{signupErrors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel" name="phone_number" value={signupForm.phone_number}
                        onChange={handleSignupChange} placeholder="+250 78X XXX XXX"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.phone_number ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {signupErrors.phone_number && <span className="text-xs text-red-500">{signupErrors.phone_number}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSignupStep(1)}
                      className="flex items-center justify-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer bg-white"
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button type="button" onClick={goNextSignup}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer border-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {signupStep === 3 && (
                <form onSubmit={handleSignup} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Create Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showSignupPw ? "text" : "password"} name="password" value={signupForm.password}
                        onChange={handleSignupChange} placeholder="At least 8 characters" autoFocus autoComplete="new-password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.password ? "border-red-400" : "border-gray-200"}`}
                      />
                      <button type="button" onClick={() => setShowSignupPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                        {showSignupPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signupForm.password && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength ? strengthColors[pwStrength] : "bg-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{strengthLabel[pwStrength]}</span>
                      </div>
                    )}
                    {signupErrors.password && <span className="text-xs text-red-500">{signupErrors.password}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPw ? "text" : "password"} name="confirmPassword" value={signupForm.confirmPassword}
                        onChange={handleSignupChange} placeholder="Repeat your password" autoComplete="new-password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 ${signupErrors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && <span className="text-xs text-red-500">{signupErrors.confirmPassword}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSignupStep(2)}
                      className="flex items-center justify-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer bg-white"
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button type="submit" disabled={signupLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 rounded-full font-bold text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer border-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {signupLoading ? <Loader2 size={16} className="animate-spin" /> : <><Leaf size={15} /> Join KainaFresh</>}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-center text-xs text-gray-500 mt-1">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-[#076935] font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                  Sign in instead
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Checkout Page ─────────────────────────────────────────────────────────────

export default function Checkout() {
  usePageTitle("checkout", "Checkout");

  const { cartItems, cartSubtotal, cartTotal, clearCart, orderSegment } = useCart();
  const { cartItems, cartSubtotal, cartTotal, clearCart, orderSegment } = useCart();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { user, isAuthenticated } = useAuth();

  // Auth gate — show modal when not logged in
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Open auth gate on page load if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      setShowAuthGate(true);
    }
  }, [isAuthenticated]);

  // Checkout steps: 1 = Order Summary, 2 = Delivery & Payment
  const [checkoutStep, setCheckoutStep] = useState(1);
  // Auth gate — show modal when not logged in
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Open auth gate on page load if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      setShowAuthGate(true);
    }
  }, [isAuthenticated]);

  // Checkout steps: 1 = Order Summary, 2 = Delivery & Payment
  const [checkoutStep, setCheckoutStep] = useState(1);

  const [form, setForm] = useState<DeliveryForm>({
    fullName: user?.full_name || "",
    phone: user?.phone_number || "",
    email: user?.email || "",
  const [form, setForm] = useState<DeliveryForm>({
    fullName: user?.full_name || "",
    phone: user?.phone_number || "",
    email: user?.email || "",
    district: "Kigali - Gasabo",
    address: "",
    notes: "",
    paymentMethod: "momo",
  });

  // Always sync delivery fields from user profile whenever auth state changes
  // (covers the case where user just signed up or logged in via the auth gate modal)
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        phone: user.phone_number || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Always sync delivery fields from user profile whenever auth state changes
  // (covers the case where user just signed up or logged in via the auth gate modal)
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        phone: user.phone_number || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const resolveImage = useCallback((path?: string) => {
  const resolveImage = useCallback((path?: string) => {
    if (!path) return placeholderImg;
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
  }, [API_BASE]);
  }, [API_BASE]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg(null);
  };

  const belowMinItems = cartItems.filter((item) => {
    const minQty =
      item.product.purchaseType === "wholesale"
        ? item.product.wholesale_min_qty ?? 1
        : item.product.retail_min_qty ?? 1;
    return item.quantity < minQty;
  });
  const belowMinItems = cartItems.filter((item) => {
    const minQty =
      item.product.purchaseType === "wholesale"
        ? item.product.wholesale_min_qty ?? 1
        : item.product.retail_min_qty ?? 1;
    return item.quantity < minQty;
  });

  // Step 1 → Step 2 validation
  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      setErrorMsg("Your basket is empty. Add items before proceeding.");
      return;
    }
    if (belowMinItems.length > 0) {
      setErrorMsg("One or more items are below their minimum quantity. Please adjust before continuing.");
      return;
    }
    setErrorMsg(null);
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Step 1 → Step 2 validation
  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      setErrorMsg("Your basket is empty. Add items before proceeding.");
      return;
    }
    if (belowMinItems.length > 0) {
      setErrorMsg("One or more items are below their minimum quantity. Please adjust before continuing.");
      return;
    }
    setErrorMsg(null);
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final order submission
  // Final order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.district.trim()) {
      setErrorMsg("Please fill in your Full Name, Phone Number, and Delivery District.");
      setErrorMsg("Please fill in your Full Name, Phone Number, and Delivery District.");
      return;
    }
    if (cartItems.length === 0) {
      setErrorMsg("Your basket is empty.");
      setErrorMsg("Your basket is empty.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    const generatedOrderId = `KF-${Date.now().toString().slice(-6)}`;

    try {
      const nameParts = form.fullName.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] ?? "";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] ?? "";
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] ?? "";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] ?? "";

      const customerPayload = {
        full_name: form.fullName.trim(),
        full_name: form.fullName.trim(),
        first_name: firstName,
        last_name: lastName,
        phone: form.phone.trim(),
        email: form.email.trim() || "",
        address: `${form.address}, ${form.district}`.trim() || form.district,
        segment: orderSegment === "wholesale" ? "wholesale" : "retail",
        phone: form.phone.trim(),
        email: form.email.trim() || "",
        address: `${form.address}, ${form.district}`.trim() || form.district,
        segment: orderSegment === "wholesale" ? "wholesale" : "retail",
      };

      let customerId: number | string | undefined;

      try {
        const customerResponse = await apiPost<{
          success?: boolean; message?: string; id?: number | string; data?: { id?: number | string };
        }>("/api/customers", customerPayload);
        if (customerResponse.success) {
          customerId = customerResponse.data?.id || customerResponse.id;
        }
      } catch (custErr) {
        console.warn("Customer record creation notice:", custErr);
      }

     

      const orderResponse = await apiPost<{
        success?: boolean; message?: string; id?: number | string; data?: { id?: number | string };
      }>("/api/orders", {
        user_id: Number(user?.id) || 1,
        customer_id: customerId || null,
        total: cartTotal,
        orderId: generatedOrderId,
        orderId: generatedOrderId,
        status: "pending",
        order_source: "ecommerce",
      });
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      const orderId = orderResponse.data?.id || orderResponse.id;

      await Promise.all(
        cartItems.map((item) =>
          apiPost<{ success?: boolean; message?: string }>(`/api/orders/${orderId}/items`, {
            product_id: item.product.id,
            quantity: item.quantity,
            orderId: `KF-${String(orderId).padStart(5, "0")}`,
          }).then((res) => {
            if (!res.success) throw new Error(`Failed to add ${item.product.name} to order`);
          })
        )
      );

      //const randomRef = `KF-${String(orderId).padStart(5, "0")}`;
     
      setOrderConfirmation({
        orderRef: generatedOrderId,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        }),
        form,
        items: cartItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price) || 0,
          unit: item.product.unit || "kg",
        })),
        subtotal: cartSubtotal,
        total: cartTotal,
      });

      clearCart();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to place your order. Please try again.");
      setErrorMsg(error instanceof Error ? error.message : "Failed to place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Auth Gate Modal */}
      {showAuthGate && (
        <AuthGateModal
          onClose={() => {
            setShowAuthGate(false);
            // If they closed without logging in, go back to products
            if (!isAuthenticated()) navigate("/products");
          }}
          onAuthSuccess={() => setShowAuthGate(false)}
        />
      )}

      {/* Auth Gate Modal */}
      {showAuthGate && (
        <AuthGateModal
          onClose={() => {
            setShowAuthGate(false);
            // If they closed without logging in, go back to products
            if (!isAuthenticated()) navigate("/products");
          }}
          onAuthSuccess={() => setShowAuthGate(false)}
        />
      )}

      <Navbar />

      <main
        className="pt-20 overflow-x-hidden font-sans bg-[#FFFDF9] min-h-screen"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* ── Order Confirmation Screen ── */}
        {/* ── Order Confirmation Screen ── */}
        {orderConfirmation ? (
          <div className="py-16 px-6 md:px-[5%] max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#076935]/15 shadow-2xl text-center">
              <div className="w-24 h-24 rounded-full bg-[#076935]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={56} className="text-[#076935]" />
              </div>
              <h2 className="text-3xl font-bold text-[#076935] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              <h2 className="text-3xl font-bold text-[#076935] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Order Placed Successfully!
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Thank you, <strong>{orderConfirmation.form.fullName}</strong>. Your fresh produce is being prepared.
                Thank you, <strong>{orderConfirmation.form.fullName}</strong>. Your fresh produce is being prepared.
              </p>

              <div className="bg-[#f4faf7] border border-dashed border-[#076935] rounded-2xl p-5 flex flex-col items-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F39927]" style={{ fontFamily: "var(--font-heading)" }}>
                  Order Reference
                <span className="text-xs font-bold uppercase tracking-wider text-[#F39927]" style={{ fontFamily: "var(--font-heading)" }}>
                  Order Reference
                </span>
                <strong className="text-3xl font-bold text-[#076935] tracking-wider my-1" style={{ fontFamily: "var(--font-heading)" }}>
                <strong className="text-3xl font-bold text-[#076935] tracking-wider my-1" style={{ fontFamily: "var(--font-heading)" }}>
                  {orderConfirmation.orderRef}
                </strong>
                <span className="text-xs text-gray-500">Placed on {orderConfirmation.date}</span>
                <span className="text-xs text-gray-500">Placed on {orderConfirmation.date}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-base text-[#076935] flex items-center gap-2 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    <MapPin size={16} /> Delivery Address
                  <h3 className="font-bold text-base text-[#076935] flex items-center gap-2 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    <MapPin size={16} /> Delivery Address
                  </h3>
                  <p className="text-sm text-gray-800 font-semibold mb-1">{orderConfirmation.form.fullName}</p>
                  <p className="text-sm text-gray-600 mb-1">{orderConfirmation.form.address}</p>
                  <p className="text-sm text-gray-600 mb-1">{orderConfirmation.form.district}</p>
                  <p className="text-sm text-gray-600">Phone: {orderConfirmation.form.phone}</p>
                  <p className="text-sm text-gray-800 font-semibold mb-1">{orderConfirmation.form.fullName}</p>
                  <p className="text-sm text-gray-600 mb-1">{orderConfirmation.form.address}</p>
                  <p className="text-sm text-gray-600 mb-1">{orderConfirmation.form.district}</p>
                  <p className="text-sm text-gray-600">Phone: {orderConfirmation.form.phone}</p>
                </div>
                <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-base text-[#076935] flex items-center gap-2 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    <CreditCard size={16} /> Payment Details
                  <h3 className="font-bold text-base text-[#076935] flex items-center gap-2 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    <CreditCard size={16} /> Payment Details
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Method:{" "}
                    <strong>
                      {orderConfirmation.form.paymentMethod === "momo" ? "MTN Mobile Money" :
                        orderConfirmation.form.paymentMethod === "airtel" ? "Airtel Money" :
                          orderConfirmation.form.paymentMethod === "cod" ? "Cash on Delivery" : "Credit / Debit Card"}
                      {orderConfirmation.form.paymentMethod === "momo" ? "MTN Mobile Money" :
                        orderConfirmation.form.paymentMethod === "airtel" ? "Airtel Money" :
                          orderConfirmation.form.paymentMethod === "cod" ? "Cash on Delivery" : "Credit / Debit Card"}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Status: <span className="inline-block bg-[#F39927]/15 text-[#F39927] text-xs font-bold px-2.5 py-0.5 rounded-full">Pending Delivery</span>
                    Status: <span className="inline-block bg-[#F39927]/15 text-[#F39927] text-xs font-bold px-2.5 py-0.5 rounded-full">Pending Delivery</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Truck size={16} className="text-[#076935]" />
                    <span>Estimated Delivery: <strong>Tomorrow, 8:00 AM – 12:00 PM</strong></span>
                    <span>Estimated Delivery: <strong>Tomorrow, 8:00 AM – 12:00 PM</strong></span>
                  </div>
                </div>
              </div>

              {/* Items */}
              {/* Items */}
              <div className="text-left bg-[#FFFDF9] p-6 rounded-2xl border border-gray-100 mb-8">
                <h3 className="font-bold text-base text-[#076935] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                <h3 className="font-bold text-base text-[#076935] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Ordered Produce Summary
                </h3>
                <div className="flex flex-col gap-2.5 mb-4">
                  {orderConfirmation.items.map((item, idx) => (
                    <div key={`${item.name}-${idx}`} className="flex justify-between text-sm text-gray-800">
                      <span>{item.name} × {item.quantity} {item.unit}</span>
                      <strong className="text-[#076935]">RWF {(item.price * item.quantity).toLocaleString()}</strong>
                    <div key={`${item.name}-${idx}`} className="flex justify-between text-sm text-gray-800">
                      <span>{item.name} × {item.quantity} {item.unit}</span>
                      <strong className="text-[#076935]">RWF {(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Subtotal</span><span>RWF {orderConfirmation.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Subtotal</span><span>RWF {orderConfirmation.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-dashed border-gray-200">
                    <span>Total Amount</span>
                    <strong className="text-xl text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>RWF {orderConfirmation.total.toLocaleString()}</strong>
                    <strong className="text-xl text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>RWF {orderConfirmation.total.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-8 py-3.5 rounded-full font-bold text-base transition-all shadow-md cursor-pointer border-0"
                  className="inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-8 py-3.5 rounded-full font-bold text-base transition-all shadow-md cursor-pointer border-0"
                  onClick={() => navigate("/products")}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Continue Shopping <ArrowRight size={16} />
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[#076935] text-[#076935] hover:bg-[#076935] hover:text-white px-8 py-3.5 rounded-full font-bold text-base transition-all cursor-pointer"
                  onClick={() => navigate("/")}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Back to Home
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Banner ── */}
            <section className="py-12 px-6 md:px-[5%] bg-gradient-to-br from-[#076935]/[0.06] to-[#F39927]/[0.06]">
              <div className="max-w-5xl mx-auto">
            {/* ── Banner ── */}
            <section className="py-12 px-6 md:px-[5%] bg-gradient-to-br from-[#076935]/[0.06] to-[#F39927]/[0.06]">
              <div className="max-w-5xl mx-auto">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#076935] hover:text-[#F39927] transition-colors mb-4"
                >
                  <ArrowLeft size={16} /> Back to Products
                  <ArrowLeft size={16} /> Back to Products
                </Link>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${checkoutStep === 1 ? "bg-[#076935] text-white" : "bg-[#076935]/10 text-[#076935]"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    <ShoppingBag size={14} /> 1. Order Summary
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300 rounded" />
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${checkoutStep === 2 ? "bg-[#076935] text-white" : "bg-gray-100 text-gray-400"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    <CreditCard size={14} /> 2. Delivery & Payment
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                  {checkoutStep === 1 ? "Your Order Summary" : "Delivery & Payment"}

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${checkoutStep === 1 ? "bg-[#076935] text-white" : "bg-[#076935]/10 text-[#076935]"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    <ShoppingBag size={14} /> 1. Order Summary
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300 rounded" />
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${checkoutStep === 2 ? "bg-[#076935] text-white" : "bg-gray-100 text-gray-400"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    <CreditCard size={14} /> 2. Delivery & Payment
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                  {checkoutStep === 1 ? "Your Order Summary" : "Delivery & Payment"}
                </h1>
                <p className="text-gray-600 text-base mt-1">
                  {checkoutStep === 1
                    ? "Review your selected produce and quantities before proceeding."
                    : "Enter your delivery details and choose your preferred payment method."}
                <p className="text-gray-600 text-base mt-1">
                  {checkoutStep === 1
                    ? "Review your selected produce and quantities before proceeding."
                    : "Enter your delivery details and choose your preferred payment method."}
                </p>
              </div>
            </section>

            <section className="py-10 px-6 md:px-[5%] pb-24">
              <div className="max-w-5xl mx-auto">

                {errorMsg && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium mb-6">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" /> {errorMsg}
                  </div>
                )}
            <section className="py-10 px-6 md:px-[5%] pb-24">
              <div className="max-w-5xl mx-auto">

                {errorMsg && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium mb-6">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" /> {errorMsg}
                  </div>
                )}

                {/* ══ STEP 1: ORDER SUMMARY ══ */}
                {checkoutStep === 1 && (
                  <div className="bg-white rounded-3xl border border-[#076935]/10 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#076935]/10 flex items-center justify-center">
                        <ShoppingBag size={20} className="text-[#076935]" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                          Review Your Cart
                        </h2>
                        <p className="text-xs text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your basket</p>
                      </div>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="p-16 text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <ShoppingBag size={36} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Your basket is empty.</p>
                        <Link to="/products" className="inline-flex items-center gap-2 bg-[#076935] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#055028] transition-all">
                          Browse Products <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-gray-50">
                          {cartItems.map(({ product, quantity }) => {
                            const img = resolveImage(product.image || product.product_image);
                            const price = Number(product.price) || 0;
                            const unit = product.unit || product.unit_name || "kg";
                            const minQty = product.purchaseType === "wholesale" ? (product.wholesale_min_qty ?? 1) : (product.retail_min_qty ?? 1);
                            const belowMin = quantity < minQty;

                            return (
                              <div key={`${product.id}|${product.purchaseType ?? "retail"}`} className="p-5 flex items-center gap-4">
                                <img src={img} alt={product.name} className="w-16 h-16 rounded-2xl object-cover bg-[#f4faf7] shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#F39927]" style={{ fontFamily: "var(--font-heading)" }}>
                                    {product.category || "Organic"} · {product.purchaseType === "wholesale" ? "Wholesale" : "Retail"}
                                  </p>
                                  <h4 className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: "var(--font-heading)" }}>{product.name}</h4>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {quantity} {unit} × RWF {price.toLocaleString()} / {unit}
                                    {belowMin && <span className="ml-2 text-amber-600 font-semibold">⚠ Below min qty ({minQty})</span>}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-bold text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                                    RWF {(price * quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Totals */}
                        <div className="p-6 bg-[#f4faf7] border-t border-gray-100">
                          <div className="flex flex-col gap-2 text-sm text-gray-600 mb-5">
                            <div className="flex justify-between">
                              <span>Subtotal ({cartItems.length} items)</span>
                              <span>RWF {cartSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-dashed border-gray-200">
                              <span>Total</span>
                              <strong className="text-xl text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                                RWF {cartTotal.toLocaleString()}
                              </strong>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <div className="flex gap-4 text-xs text-gray-500 flex-1">
                              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#076935]" /> Quality Guaranteed</span>
                              <span className="flex items-center gap-1.5"><Truck size={14} className="text-[#076935]" /> Cold Chain Delivery</span>
                            </div>
                            <button
                              onClick={handleProceedToPayment}
                              disabled={cartItems.length === 0 || belowMinItems.length > 0}
                              className="inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Proceed to Payment <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ══ STEP 2: DELIVERY & PAYMENT ══ */}
                {checkoutStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Form */}
                    <div className="lg:col-span-7">
                      <form onSubmit={handleSubmitOrder} className="flex flex-col gap-6">
                        {/* Delivery Info */}
                        <div className="bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs">
                          <h2 className="text-lg font-bold text-[#076935] flex items-center gap-2 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
                            <User size={17} /> Delivery Information
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">Full Name</label>
                              <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange}
                                placeholder="Auto-filled from your profile"
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">Phone (MoMo / WhatsApp)</label>
                              <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange}
                                placeholder="Auto-filled from your profile"
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs font-semibold text-gray-700">Email (Optional)</label>
                            <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                              placeholder="your@email.com"
                              className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">District / City *</label>
                              <select id="district" name="district" value={form.district} onChange={handleChange}
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 bg-white cursor-pointer"
                              >
                                {["Kigali - Gasabo", "Kigali - Kicukiro", "Kigali - Nyarugenge", "Bugesera / Outer Kigali", "Other District (Upcountry)"].map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">Street / Landmark</label>
                              <input id="address" type="text" name="address" value={form.address} onChange={handleChange}
                                placeholder="KG 123 St, House No. 4"
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Delivery Notes (Optional)</label>
                            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange}
                              placeholder="Gate code, call before arrival, morning delivery preferred..."
                              rows={3}
                              className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 resize-y"
                            />
                          </div>
                        </div>
                {/* ══ STEP 1: ORDER SUMMARY ══ */}
                {checkoutStep === 1 && (
                  <div className="bg-white rounded-3xl border border-[#076935]/10 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#076935]/10 flex items-center justify-center">
                        <ShoppingBag size={20} className="text-[#076935]" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                          Review Your Cart
                        </h2>
                        <p className="text-xs text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your basket</p>
                      </div>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="p-16 text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <ShoppingBag size={36} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Your basket is empty.</p>
                        <Link to="/products" className="inline-flex items-center gap-2 bg-[#076935] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#055028] transition-all">
                          Browse Products <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-gray-50">
                          {cartItems.map(({ product, quantity }) => {
                            const img = resolveImage(product.image || product.product_image);
                            const price = Number(product.price) || 0;
                            const unit = product.unit || product.unit_name || "kg";
                            const minQty = product.purchaseType === "wholesale" ? (product.wholesale_min_qty ?? 1) : (product.retail_min_qty ?? 1);
                            const belowMin = quantity < minQty;

                            return (
                              <div key={`${product.id}|${product.purchaseType ?? "retail"}`} className="p-5 flex items-center gap-4">
                                <img src={img} alt={product.name} className="w-16 h-16 rounded-2xl object-cover bg-[#f4faf7] shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#F39927]" style={{ fontFamily: "var(--font-heading)" }}>
                                    {product.category || "Organic"} · {product.purchaseType === "wholesale" ? "Wholesale" : "Retail"}
                                  </p>
                                  <h4 className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: "var(--font-heading)" }}>{product.name}</h4>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {quantity} {unit} × RWF {price.toLocaleString()} / {unit}
                                    {belowMin && <span className="ml-2 text-amber-600 font-semibold">⚠ Below min qty ({minQty})</span>}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-bold text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                                    RWF {(price * quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Totals */}
                        <div className="p-6 bg-[#f4faf7] border-t border-gray-100">
                          <div className="flex flex-col gap-2 text-sm text-gray-600 mb-5">
                            <div className="flex justify-between">
                              <span>Subtotal ({cartItems.length} items)</span>
                              <span>RWF {cartSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-dashed border-gray-200">
                              <span>Total</span>
                              <strong className="text-xl text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                                RWF {cartTotal.toLocaleString()}
                              </strong>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <div className="flex gap-4 text-xs text-gray-500 flex-1">
                              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#076935]" /> Quality Guaranteed</span>
                              <span className="flex items-center gap-1.5"><Truck size={14} className="text-[#076935]" /> Cold Chain Delivery</span>
                            </div>
                            <button
                              onClick={handleProceedToPayment}
                              disabled={cartItems.length === 0 || belowMinItems.length > 0}
                              className="inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Proceed to Payment <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ══ STEP 2: DELIVERY & PAYMENT ══ */}
                {checkoutStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Form */}
                    <div className="lg:col-span-7">
                      <form onSubmit={handleSubmitOrder} className="flex flex-col gap-6">
                        {/* Delivery Info */}
                        <div className="bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs">
                          <h2 className="text-lg font-bold text-[#076935] flex items-center gap-2 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
                            <User size={17} /> Delivery Information
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">Full Name</label>
                              <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange}
                                placeholder="Auto-filled from your profile"
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">Phone (MoMo / WhatsApp)</label>
                              <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange}
                                placeholder="Auto-filled from your profile"
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs font-semibold text-gray-700">Email (Optional)</label>
                            <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                              placeholder="your@email.com"
                              className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">District / City *</label>
                              <select id="district" name="district" value={form.district} onChange={handleChange}
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 bg-white cursor-pointer"
                              >
                                {["Kigali - Gasabo", "Kigali - Kicukiro", "Kigali - Nyarugenge", "Bugesera / Outer Kigali", "Other District (Upcountry)"].map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-700">Street / Landmark</label>
                              <input id="address" type="text" name="address" value={form.address} onChange={handleChange}
                                placeholder="KG 123 St, House No. 4"
                                className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Delivery Notes (Optional)</label>
                            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange}
                              placeholder="Gate code, call before arrival, morning delivery preferred..."
                              rows={3}
                              className="p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/10 resize-y"
                            />
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs">
                          <h2 className="text-lg font-bold text-[#076935] flex items-center gap-2 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
                            <CreditCard size={17} /> Payment Method
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { value: "momo", icon: <Phone size={18} className="text-[#F39927]" />, label: "MTN Mobile Money", desc: "Pay via MTN MoMo prompt (*182*8*1*...#)" },
                              { value: "airtel", icon: <Phone size={18} className="text-red-500" />, label: "Airtel Money", desc: "Pay via Airtel Money wallet on delivery" },
                              { value: "cod", icon: <Truck size={18} className="text-[#076935]" />, label: "Cash on Delivery", desc: "Pay in cash to our rider upon receipt" },
                              { value: "card", icon: <CreditCard size={18} className="text-blue-500" />, label: "Credit / Debit Card", desc: "Visa, MasterCard & international debit cards" },
                            ].map(({ value, icon, label, desc }) => (
                              <label key={value}
                                className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${form.paymentMethod === value ? "border-[#076935] bg-[#f4faf7]" : "border-gray-200 bg-white hover:border-[#076935]/50"}`}
                              >
                                <input type="radio" name="paymentMethod" value={value}
                                  checked={form.paymentMethod === value as DeliveryForm["paymentMethod"]}
                                  onChange={handleChange} className="mt-1 accent-[#076935]"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>
                                    {icon} {label}
                                  </div>
                                  <p className="text-xs text-gray-500 m-0">{desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* Payment Method */}
                        <div className="bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs">
                          <h2 className="text-lg font-bold text-[#076935] flex items-center gap-2 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
                            <CreditCard size={17} /> Payment Method
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { value: "momo", icon: <Phone size={18} className="text-[#F39927]" />, label: "MTN Mobile Money", desc: "Pay via MTN MoMo prompt (*182*8*1*...#)" },
                              { value: "airtel", icon: <Phone size={18} className="text-red-500" />, label: "Airtel Money", desc: "Pay via Airtel Money wallet on delivery" },
                              { value: "cod", icon: <Truck size={18} className="text-[#076935]" />, label: "Cash on Delivery", desc: "Pay in cash to our rider upon receipt" },
                              { value: "card", icon: <CreditCard size={18} className="text-blue-500" />, label: "Credit / Debit Card", desc: "Visa, MasterCard & international debit cards" },
                            ].map(({ value, icon, label, desc }) => (
                              <label key={value}
                                className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${form.paymentMethod === value ? "border-[#076935] bg-[#f4faf7]" : "border-gray-200 bg-white hover:border-[#076935]/50"}`}
                              >
                                <input type="radio" name="paymentMethod" value={value}
                                  checked={form.paymentMethod === value as DeliveryForm["paymentMethod"]}
                                  onChange={handleChange} className="mt-1 accent-[#076935]"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>
                                    {icon} {label}
                                  </div>
                                  <p className="text-xs text-gray-500 m-0">{desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button type="button" onClick={() => { setCheckoutStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3.5 rounded-full font-bold text-sm transition-all cursor-pointer bg-white"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            <ArrowLeft size={16} /> Back to Summary
                          </button>
                          <button type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white font-bold text-base py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                            disabled={submitting || cartItems.length === 0}
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {submitting ? (
                              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <><CheckCircle size={18} /> Place Order — RWF {cartTotal.toLocaleString()}</>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button type="button" onClick={() => { setCheckoutStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3.5 rounded-full font-bold text-sm transition-all cursor-pointer bg-white"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            <ArrowLeft size={16} /> Back to Summary
                          </button>
                          <button type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white font-bold text-base py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                            disabled={submitting || cartItems.length === 0}
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {submitting ? (
                              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <><CheckCircle size={18} /> Place Order — RWF {cartTotal.toLocaleString()}</>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Right: Sidebar Summary */}
                    <div className="lg:col-span-5 sticky top-28">
                      <div className="bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs">
                        <h2 className="font-bold text-lg text-[#076935] flex items-center gap-2 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
                          <ShoppingBag size={18} /> Order Summary
                        </h2>
                        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-5 pr-1">
                    {/* Right: Sidebar Summary */}
                    <div className="lg:col-span-5 sticky top-28">
                      <div className="bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs">
                        <h2 className="font-bold text-lg text-[#076935] flex items-center gap-2 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
                          <ShoppingBag size={18} /> Order Summary
                        </h2>
                        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-5 pr-1">
                          {cartItems.map(({ product, quantity }) => {
                            const img = resolveImage(product.image || product.product_image);
                            const img = resolveImage(product.image || product.product_image);
                            const price = Number(product.price) || 0;
                            const unit = product.unit || "kg";
                            const unit = product.unit || "kg";
                            return (
                              <div key={`${product.id}|${product.purchaseType ?? "retail"}`} className="flex items-center gap-3">
                                <img src={img} alt={product.name} className="w-11 h-11 rounded-xl object-cover bg-[#f4faf7] shrink-0" />
                              <div key={`${product.id}|${product.purchaseType ?? "retail"}`} className="flex items-center gap-3">
                                <img src={img} alt={product.name} className="w-11 h-11 rounded-xl object-cover bg-[#f4faf7] shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-800 truncate" style={{ fontFamily: "var(--font-heading)" }}>{product.name}</p>
                                  <p className="text-xs text-gray-400">{quantity} {unit}</p>
                                  <p className="font-semibold text-sm text-gray-800 truncate" style={{ fontFamily: "var(--font-heading)" }}>{product.name}</p>
                                  <p className="text-xs text-gray-400">{quantity} {unit}</p>
                                </div>
                                <strong className="text-sm text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                                <strong className="text-sm text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>
                                  RWF {(price * quantity).toLocaleString()}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 text-sm text-gray-600">
                          <div className="flex justify-between"><span>Subtotal</span><span>RWF {cartSubtotal.toLocaleString()}</span></div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 text-sm text-gray-600">
                          <div className="flex justify-between"><span>Subtotal</span><span>RWF {cartSubtotal.toLocaleString()}</span></div>
                          <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-dashed border-gray-200">
                            <span>Total</span>
                            <strong className="text-xl text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>RWF {cartTotal.toLocaleString()}</strong>
                            <strong className="text-xl text-[#076935]" style={{ fontFamily: "var(--font-heading)" }}>RWF {cartTotal.toLocaleString()}</strong>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600"><ShieldCheck size={14} className="text-[#076935]" /> 100% Organic Quality Guarantee</div>
                          <div className="flex items-center gap-2 text-xs text-gray-600"><Truck size={14} className="text-[#076935]" /> 24-Hour Cold Chain Delivery</div>
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600"><ShieldCheck size={14} className="text-[#076935]" /> 100% Organic Quality Guarantee</div>
                          <div className="flex items-center gap-2 text-xs text-gray-600"><Truck size={14} className="text-[#076935]" /> 24-Hour Cold Chain Delivery</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}