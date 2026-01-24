import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MarketingLayout from './layouts/MarketingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthGuard from './components/layout/AuthGuard';

// Pages
import Home from './pages/Home';
import FieldDetail from './pages/FieldDetail';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';

// Dashboard Features
import Overview from './features/dashboard/Overview';
import Bookings from './features/dashboard/Bookings';
import Fields from './features/dashboard/Fields';
import SettingsPage from './features/dashboard/Settings';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (Marketing) */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/field/:id" element={<FieldDetail />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Dashboard) */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }>
            <Route index element={<Overview />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="schedule" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Coming Soon</div>} />
            <Route path="fields" element={<Fields />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
