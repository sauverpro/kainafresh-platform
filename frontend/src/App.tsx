import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import Placeholder from "./pages/Placeholder";
import PageShellSkeleton from "./components/skeletons/PageShellSkeleton";
import ScrollToTop from "./components/common/ScrollToTop";
import { isAuthenticated } from "./api/client";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { canAccessPath, normalizeRole, DEFAULT_HOME } from "./auth/roleAccess";
import { sideNavData } from "./assets/data/sideNavData";
import type { NavItem } from "./assets/data/sideNavData.types";

// Code-split pages so only the active view's chunk is fetched, with a
// centered loader shown while each chunk loads during navigation.
const Home = lazy(() => import("./pages/home/Home"));
const OurProducts = lazy(() => import("./pages/products/OurProducts"));
const ProductDetailPage = lazy(
  () => import("./pages/products/ProductDetailPage"),
);
const Checkout = lazy(() => import("./pages/checkout/Checkout"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const About = lazy(() => import("./pages/about/About"));
const Contact = lazy(() => import("./pages/contact/Contact"));
const Wholesale = lazy(() => import("./pages/wholesale/Wholesale"));
const TrackOrder = lazy(() => import("./pages/orders/TrackOrder"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CmsPage = lazy(() => import("./pages/cms/CmsPage"));
const ProductsList = lazy(() => import("./pages/admin/Products/ProductsList"));
const OrdersList = lazy(() => import("./pages/admin/Orders/OrdersList"));
const CustomerList = lazy(() => import("./pages/admin/Customers/CustomerList"));
const InvoicesList = lazy(() => import("./pages/admin/Invoices/InvoicesList"));
const SalesList = lazy(() => import("./pages/admin/Sales/SalesList"));
const ProductDetail = lazy(
  () => import("./components/products/ProductDetail"),
);
const InventoryList = lazy(() => import("./pages/admin/Inventory/InventoryList"));
const StockDetail = lazy(() => import("./components/stock/StockDetail"));
const GlobalSettings = lazy(
  () => import("./pages/admin/Settings/GlobalSettings"),
);
const UserManagement = lazy(() => import("./pages/admin/Users/UserManagement"));
const TeamManagement = lazy(() => import("./pages/admin/Team/TeamManagement"));

// Lazy load HR pages
const HRDashboard = lazy(() => import("./pages/admin/HR/HRDashboard"));
const DepartmentManagement = lazy(() => import("./pages/admin/HR/DepartmentManagement"));
const EmployeeProfiles = lazy(() => import("./pages/admin/HR/EmployeeProfiles"));
const LeaveManagement = lazy(() => import("./pages/admin/HR/LeaveManagement"));
const Payroll = lazy(() => import("./pages/admin/HR/Payroll"));
const Performance = lazy(() => import("./pages/admin/HR/Performance"));
const TrainingDevelopment = lazy(() => import("./pages/admin/HR/TrainingDevelopment"));
const HealthSafety = lazy(() => import("./pages/admin/HR/HealthSafety"));
const Insurance = lazy(() => import("./pages/admin/HR/Insurance"));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-based route protection: redirect denied users to their role's home.
  if (!canAccessPath(location.pathname, user)) {
    const home = DEFAULT_HOME[normalizeRole(user?.role)] ?? "/";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}

function collectRoutes(items: NavItem[]): { path: string; label: string }[] {
  return items.flatMap((item) => {
    if (item.subItems?.length) {
      return item.subItems.flatMap((sub) => {
        if (sub.otherSub?.length) {
          return sub.otherSub
            .filter((child): child is { label: string; path: string } =>
              Boolean(child.path),
            )
            .map((child) => ({ path: child.path, label: child.label }));
        }
        if (sub.path) {
          return [{ path: sub.path, label: sub.label }];
        }
        return [];
      });
    }
    if (item.path) {
      return [{ path: item.path, label: item.label }];
    }
    return [];
  });
}

const routes = sideNavData
  .flatMap((section) => collectRoutes(section.items))
  .filter(
    (route) =>
      !route.path.startsWith("/cms/") &&
      !route.path.startsWith("/admin/hr/") &&
      route.path !== "/settings" &&
      route.path !== "/admin/users" &&
      route.path !== "/admin/products" &&
      route.path !== "/admin/orders" &&
      route.path !== "/admin/customers" &&
      route.path !== "/ecommerce/orders" &&
      route.path !== "/ecommerce/invoices" &&
      route.path !== "/sales" &&
      route.path !== "/stock" &&
      route.path !== "/inventory" &&
      route.path !== "/products"
  );

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <SidebarProvider>
          <CartProvider>
          <Suspense fallback={<PageShellSkeleton />}>
            <Routes>
              {/* Public E-Commerce & Info Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<OurProducts />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/wholesale" element={<Wholesale />} />
              <Route path="/track-order" element={<TrackOrder />} />

              {/* Authenticated Dashboard */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<GlobalSettings />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/team" element={<TeamManagement />} />
                <Route path="/cms/settings" element={<GlobalSettings />} />
                <Route path="/cms/:slug" element={<CmsPage />} />
                <Route path="/admin/products" element={<ProductsList />} />
                <Route path="/admin/products/:id" element={<ProductDetail />} />
                <Route path="/admin/orders" element={<OrdersList />} />
                <Route path="/admin/customers" element={<CustomerList />} />
                <Route path="/ecommerce/invoices" element={<InvoicesList />} />
                <Route path="/sales" element={<SalesList />} />
                <Route path="/ecommerce/orders" element={<OrdersList />} />
                <Route path="/stock" element={<InventoryList />} />
                <Route path="/stock/:id" element={<StockDetail />} />
                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/inventory/:id" element={<StockDetail />} />

                {/* HR Module Routes */}
                <Route path="/admin/hr/dashboard" element={<HRDashboard />} />
                <Route path="/admin/hr/departments" element={<DepartmentManagement />} />
                <Route path="/admin/hr/employees" element={<EmployeeProfiles />} />
                <Route path="/admin/hr/employment-records" element={<Navigate to="/admin/hr/employees" replace />} />
                <Route path="/admin/hr/leave" element={<LeaveManagement />} />
                <Route path="/admin/hr/payroll" element={<Payroll />} />
                <Route path="/admin/hr/performance" element={<Performance />} />
                <Route path="/admin/hr/training" element={<TrainingDevelopment />} />
                <Route path="/admin/hr/health-safety" element={<HealthSafety />} />
                <Route path="/admin/hr/insurance" element={<Insurance />} />
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<Placeholder title={route.label} />}
                  />
                ))}
              </Route>

              {/* Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CartProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
