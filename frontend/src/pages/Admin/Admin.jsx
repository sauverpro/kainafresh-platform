import React from 'react';

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
      <p>This is a protected placeholder. Admin dashboard coming soon.</p>
    </div>
  );
}

export default Admin;
