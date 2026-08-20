import { Routes, Route } from 'react-router-dom';

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
    <div style={{ padding: '3rem 5%', textAlign: 'center', color: '#6B7280' }}>
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#076935' }}>
        Admin Panel
      </h1>
      <p>This is a protected placeholder. The new TSX admin dashboard is currently under construction.</p>
      <Routes>
        <Route path="/" element={<div>Dashboard Overview Placeholder</div>} />
        <Route path="/content/:slug" element={<div>CMS Editor Placeholder</div>} />
        <Route path="/products" element={<div>Products Placeholder</div>} />
        <Route path="/inventory" element={<div>Inventory Placeholder</div>} />
        <Route path="/orders" element={<div>Orders Placeholder</div>} />
        <Route path="/customers" element={<div>Customers Placeholder</div>} />
        <Route path="/reports" element={<div>Reports Placeholder</div>} />
      </Routes>
    </div>
  );
}

export default Admin;
