import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import PageEditor from './CMS/PageEditor';
import ProductsList from './Products/ProductsList';
import InventoryList from './Inventory/InventoryList';
import DashboardOverview from './Dashboard/DashboardOverview';

/**
 * Admin Panel
 * This route is protected — only accessible to authenticated users.
 * The ProtectedRoute wrapper in App.jsx handles auth checking.
 *
 * TODO: Build the admin dashboard (manage products, orders, CMS content, inventory).
 * Role required: 'admin' (returned by the /api/login and /api/me endpoints).
 */
function Admin() {
  return (
    <AdminLayout>
      <Routes>
        {/* /admin maps to the DashboardOverview */}
        <Route path="/" element={<DashboardOverview />} />

        {/* /admin/content/:slug maps to the CMS Editor */}
        <Route path="/content/:slug" element={<PageEditor />} />

        {/* /admin/products maps to the Products Management Dashboard */}
        <Route path="/products" element={<ProductsList />} />

        {/* /admin/inventory maps to the Inventory Dashboard */}
        <Route path="/inventory" element={<InventoryList />} />

        {/* Placeholders for other Shop Management routes */}
        <Route path="/orders" element={<div style={{ padding: '3rem' }}><h2>Orders</h2><p>Coming Soon</p></div>} />
        <Route path="/customers" element={<div style={{ padding: '3rem' }}><h2>Customers</h2><p>Coming Soon</p></div>} />
        <Route path="/reports" element={<div style={{ padding: '3rem' }}><h2>Reports</h2><p>Coming Soon</p></div>} />
      </Routes>
    </AdminLayout>
  );
}

export default Admin;
