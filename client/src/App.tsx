import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GetStartedPage from './pages/GetStartedPage';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductsPage from './pages/admin/Products';
import CategoriesPage from './pages/admin/Categories';
import FloorsPage from './pages/admin/Floors';
import EmployeesPage from './pages/admin/Employees';
import CustomersPage from './pages/admin/Customers';
import PaymentMethodsPage from './pages/admin/PaymentMethods';
import CouponsPromotionsPage from './pages/admin/CouponsPromotions';
import SessionsPage from './pages/admin/Sessions';
import ReportsPage from './pages/admin/Reports';
import SettingsPage from './pages/admin/Settings';

// POS & Kitchen
import POSTerminal from './pages/POSTerminal';
import KitchenDisplay from './pages/KitchenDisplay';

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'kitchen') return <Navigate to="/kds" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'employee') return <Navigate to="/pos" replace />;
    if (user?.role === 'kitchen') return <Navigate to="/kds" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };
    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    const handleLinkHoverEvents = () => {
      const hoverables = document.querySelectorAll(
        'a, button, [role="button"], input, select, textarea, .category-tab, .product-list-item, .table-tile, .qty-btn, .cart-item-delete'
      );
      hoverables.forEach((el) => {
        el.addEventListener("mouseover", () => setLinkHovered(true));
        el.addEventListener("mouseout", () => setLinkHovered(false));
      });
    };

    const observer = new MutationObserver(handleLinkHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });
    handleLinkHoverEvents();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      observer.disconnect();
    };
  }, []);

  if (hidden) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--brown-500)',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate3d(${position.x - 3}px, ${position.y - 3}px, 0) scale(${clicked ? 0.8 : 1})`,
          transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)',
          boxShadow: '0 0 10px rgba(158, 116, 68, 0.6)',
        }}
      />
      {/* Outer Ring */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: linkHovered ? '1px solid rgba(158, 116, 68, 0.6)' : '1px solid rgba(158, 116, 68, 0.25)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: `translate3d(${position.x - 18}px, ${position.y - 18}px, 0) scale(${linkHovered ? 1.4 : clicked ? 0.85 : 1})`,
          background: linkHovered ? 'rgba(158, 116, 68, 0.08)' : 'transparent',
          boxShadow: linkHovered ? '0 0 15px rgba(158, 116, 68, 0.15)' : 'none',
          transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <>
      <CustomCursor />
      <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(45,31,18,0.15)',
          },
          success: { iconTheme: { primary: '#3DAB6B', secondary: 'white' } },
          error: { iconTheme: { primary: '#D94F4F', secondary: 'white' } },
        }}
      />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<GetStartedPage />} />

        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin', 'employee']}><AdminLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="floors" element={<FloorsPage />} />
          <Route path="tables" element={<FloorsPage />} />
          <Route path="employees" element={<PrivateRoute allowedRoles={['admin']}><EmployeesPage /></PrivateRoute>} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="payment-methods" element={<PrivateRoute allowedRoles={['admin']}><PaymentMethodsPage /></PrivateRoute>} />
          <Route path="coupons" element={<CouponsPromotionsPage />} />
          <Route path="promotions" element={<CouponsPromotionsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<PrivateRoute allowedRoles={['admin']}><SettingsPage /></PrivateRoute>} />
        </Route>

        {/* POS Terminal */}
        <Route path="/pos" element={<PrivateRoute allowedRoles={['admin', 'employee']}><POSTerminal /></PrivateRoute>} />

        {/* Kitchen Display */}
        <Route path="/kds" element={<PrivateRoute allowedRoles={['admin', 'kitchen']}><KitchenDisplay /></PrivateRoute>} />

        {/* Default redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
