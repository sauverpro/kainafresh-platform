/**
 * ============================================================================
 * KainaFresh Organic Platform — Main Application Router & Entry Point
 * ============================================================================
 * 
 * This file serves as the core routing setup for the entire React application.
 * It manages:
 * 1. Public client-facing routes (Home, About, Wholesale, Contact, Auth).
 * 2. Protected administrative dashboard routes (/admin/*).
 * 3. Client authentication guards (ProtectedRoute component).
 * 4. Context providers (SidebarProvider for collapsible admin navigation).
 * 5. Catch-all fallback navigation redirects.
 */

// Import React Router DOM modules for single-page client routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import global state providers
import { SidebarProvider } from "./context/SidebarContext";

// Import Admin Layout shell wrapper
import AdminLayout from "./components/AdminLayout/AdminLayout";

// Import temporary placeholder component for unbuilt routes
import Placeholder from "./pages/Placeholder";

// Import client authentication checker utility
import { isAuthenticated } from "./api/client";

// Import Public Site Page Components
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Wholesale from "./pages/wholesale/Wholesale";

// Import Admin Dashboard Components
import DashboardOverview from "./pages/admin/Dashboard/DashboardOverview";
import PageEditor from "./pages/admin/CMS/PageEditor";
import ProductsList from "./pages/admin/Products/ProductsList";
import InventoryList from "./pages/admin/Inventory/InventoryList";
import GlobalSettings from "./pages/admin/Settings/GlobalSettings";

/**
 * Interface definition for ProtectedRoute wrapper props.
 * Ensures strict TypeScript type safety when passing React children nodes.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Higher-Order Component guard for admin authentication.
 * If the user does NOT possess a valid JWT session token:
 * -> Automatically redirects them to the /login page.
 * If authenticated:
 * -> Renders the protected child routes.
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if JWT token exists and is non-expired in localStorage
  if (!isAuthenticated()) {
    // Redirect unauthenticated user to login screen, replacing history state
    return <Navigate to="/login" replace />;
  }
  // Render protected child routes
  return <>{children}</>;
}

/**
 * Main Application Root Component.
 * Initializes HTML5 History Browser Router and mounts global contextual providers.
 */
function App() {
  return (
    // Wrap entire application in HTML5 History API Router
    <BrowserRouter>
      {/* Provide global sidebar collapse/expand state to all components */}
      <SidebarProvider>
        {/* Container for evaluating and rendering matched URL routes */}
        <Routes>

          {/* ----------------------------------------------------------------
           * PUBLIC ROUTES — Accessible by any website visitor
           * ---------------------------------------------------------------- */}
          {/* Landing page route */}
          <Route path="/" element={<Home />} />
          
          {/* User authentication login route */}
          <Route path="/login" element={<Login />} /> 

          {/* User account registration route */}
          <Route path="/signup" element={<Signup />} />

          {/* About Us & Our Farm information route */}
          <Route path="/about" element={<About />} />

          {/* Customer contact & inquiry route */}
          <Route path="/contact" element={<Contact />} />

          {/* Wholesale B2B & Export inquiry route */}
          <Route path="/wholesale" element={<Wholesale />} />


          {/* ----------------------------------------------------------------
           * PROTECTED ADMIN DASHBOARD ROUTES — Requires active Admin JWT Token
           * ---------------------------------------------------------------- */}
          <Route path="/admin/*" element={
            // Enforce authentication guard
            <ProtectedRoute>
              {/* Wrap all sub-dashboard routes inside the Admin layout sidebar & topbar */}
              <AdminLayout>
                <Routes>
                  {/* Dashboard Overview Main Metric Bento Grid */}
                  <Route path="/" element={<DashboardOverview />} />

                  {/* CMS Page Section Editor by slug parameter */}
                  <Route path="content/:slug" element={<PageEditor />} />

                  {/* Products Catalog Management Table */}
                  <Route path="products" element={<ProductsList />} />

                  {/* Warehouse Inventory Stock Tracker */}
                  <Route path="inventory" element={<InventoryList />} />

                  {/* Customer Orders Management Table */}
                  <Route path="orders" element={<Placeholder title="Orders Management" />} />

                  {/* Customers Directory */}
                  <Route path="customers" element={<Placeholder title="Customers" />} />

                  {/* Business & Revenue Reports */}
                  <Route path="reports" element={<Placeholder title="Reports" />} />

                  {/* Global System Settings & NavLinks Manager */}
                  <Route path="settings" element={<GlobalSettings />} />

                  {/* System User Accounts Manager */}
                  <Route path="users" element={<Placeholder title="User Management" />} />

                  {/* Fallback route within admin area */}
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />


          {/* ----------------------------------------------------------------
           * CATCH-ALL UNIVERSAL REDIRECT
           * Redirects any unknown or invalid URL paths back to Home
           * ---------------------------------------------------------------- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

// Export App component as default export for index.tsx entry point
export default App;