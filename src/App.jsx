import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicForm from './pages/PublicForm';
import Login from './pages/Login';
import DashboardOverview from './pages/DashboardOverview';
import LaporanMasuk from './pages/LaporanMasuk';
import VerifikasiAntrean from './pages/VerifikasiAntrean';
import MonitoringAudit from './pages/MonitoringAudit';
import AdminLayout from './components/AdminLayout';

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAuth(null);
  };

  // Check auth and wrap admin routes
  const ProtectedAdminRoute = ({ children }) => {
    if (!auth) {
      return <Navigate to="/login" replace />;
    }
    return (
      <AdminLayout user={auth.user} handleLogout={handleLogout}>
        {children}
      </AdminLayout>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Public Complaint Form */}
        <Route path="/" element={<PublicForm />} />

        {/* Admin Login */}
        <Route 
          path="/login" 
          element={
            auth ? <Navigate to="/admin/dashboard" replace /> : <Login setAuth={setAuth} />
          } 
        />

        {/* Protected Admin Dashboard Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <DashboardOverview auth={auth} />
            </ProtectedAdminRoute>
          } 
        />

        <Route 
          path="/admin/laporan" 
          element={
            <ProtectedAdminRoute>
              <LaporanMasuk auth={auth} />
            </ProtectedAdminRoute>
          } 
        />

        <Route 
          path="/admin/verifikasi" 
          element={
            <ProtectedAdminRoute>
              <VerifikasiAntrean auth={auth} />
            </ProtectedAdminRoute>
          } 
        />

        <Route 
          path="/admin/monitoring" 
          element={
            <ProtectedAdminRoute>
              <MonitoringAudit auth={auth} />
            </ProtectedAdminRoute>
          } 
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
