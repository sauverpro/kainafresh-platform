import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import AppLayout from "./components/layout/AppLayout";
import Placeholder from "./pages/Placeholder";
import Loader from "./components/Loader/Loader";
import { isAuthenticated } from "./api/client";
import { sideNavData } from "./assets/data/sideNavData";
import type { NavItem } from "./assets/data/sideNavData.types";

// Code-split pages so only the active view's chunk is fetched, with a
// centered loader shown while each chunk loads during navigation.
const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const About = lazy(() => import("./pages/about/About"));
const Contact = lazy(() => import("./pages/contact/Contact"));
const Wholesale = lazy(() => import("./pages/wholesale/Wholesale"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CrmPage = lazy(() => import("./pages/crm/CrmPage"));
const ProductsList = lazy(() => import("./pages/admin/Products/ProductsList"));
const ProductDetail = lazy(
  () => import("./components/products/ProductDetail"),
);
const InventoryList = lazy(() => import("./pages/admin/Inventory/InventoryList"));
const StockDetail = lazy(() => import("./components/stock/StockDetail"));
const GlobalSettings = lazy(
  () => import("./pages/admin/Settings/GlobalSettings"),
);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
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
  .filter((route) => !route.path.startsWith("/crm/"));

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
              <Loader text="Loading page..." />
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/wholesale" element={<Wholesale />} />

            {/* Authenticated Dashboard */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crm/settings" element={<GlobalSettings />} />
              <Route path="/crm/:slug" element={<CrmPage />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/inventory/:id" element={<StockDetail />} />
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
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
