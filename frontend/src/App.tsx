import { BrowserRouter, Routes, Route, Navigate } from "react-router"; // Use unified v7 routing package
import { SidebarProvider } from "./context/SidebarContext";
import AppLayout from "./components/layout/AppLayout";
import Placeholder from "./pages/Placeholder";
import { isAuthenticated } from "./api/client";
import { sideNavData } from "./assets/data/sideNavData";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Wholesale from "./pages/wholesale/Wholesale";
import EcommerceDashboard from "./pages/dashboard/EcommerceDashboard";
import CrmPage from "./pages/crm/CrmPage";
import type { NavItem } from "./assets/data/sideNavData.types";

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
            .filter((child): child is { label: string; path: string } => Boolean(child.path))
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
  .filter((route) => route.path !== "/");


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

          {/* Authenticated Dashboard*/}
          <Route 
            element={
              // <ProtectedRoute>
                <AppLayout />
              // {/* </ProtectedRoute> */}
            }
          >
            <Route path="/dashboard" element={<EcommerceDashboard />} />
            <Route path="/crm/settings" element={<Placeholder title="Settings" />} />
            <Route path="/crm/:id" element={<CrmPage />} />
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<Placeholder title={route.label} />}
              />
            ))}
          </Route>

          {/* Catch-All Universal Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;