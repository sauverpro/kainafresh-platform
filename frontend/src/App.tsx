import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import AppLayout from "./components/layout/AppLayout";
import Placeholder from "./pages/Placeholder";
import EcommerceDashboard from "./pages/Dashboard/EcommerceDashboard";
import { sideNavData } from "./data/sideNavData";
import type { NavItem } from "./data/sideNavData.types";

function collectRoutes(items: NavItem[]): { path: string; label: string }[] {
  return items.flatMap((item) => {
    if (item.subItems?.length) {
      return item.subItems.map((sub) => ({ path: sub.path, label: sub.label }));
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
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<EcommerceDashboard />} />
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<Placeholder title={route.label} />}
              />
            ))}
          </Route>
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
