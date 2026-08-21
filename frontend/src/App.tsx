import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import Placeholder from "./pages/Placeholder";
import { isAuthenticated } from "./api/client";

// Public Pages
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Wholesale from "./pages/wholesale/Wholesale";

// Admin Dashboard Pages (Cherry-picked)
import DashboardOverview from "./pages/admin/Dashboard/DashboardOverview";
import PageEditor from "./pages/admin/CMS/PageEditor";
import ProductsList from "./pages/admin/Products/ProductsList";
import InventoryList from "./pages/admin/Inventory/InventoryList";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          {/* Public Pathways */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wholesale" element={<Wholesale />} />

          {/* Authenticated Dashboard */}
          <Route path="/admin/*" element={
            // <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<DashboardOverview />} />
                  <Route path="content/:slug" element={<PageEditor />} />
                  <Route path="products" element={<ProductsList />} />
                  <Route path="inventory" element={<InventoryList />} />
                  <Route path="orders" element={<Placeholder title="Orders Management" />} />
                  <Route path="customers" element={<Placeholder title="Customers" />} />
                  <Route path="reports" element={<Placeholder title="Reports" />} />
                  <Route path="settings" element={<Placeholder title="Global Settings" />} />
                  <Route path="users" element={<Placeholder title="User Management" />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            // </ProtectedRoute>
          } />

          {/* Catch-All Universal Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;