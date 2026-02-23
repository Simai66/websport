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
import Register from './pages/Register';
import Profile from './pages/Profile';

// Dashboard Features
import Overview from './features/dashboard/Overview';
import Bookings from './features/dashboard/Bookings';
import BookingDetail from './features/dashboard/BookingDetail';
import Fields from './features/dashboard/Fields';
import Schedule from './features/dashboard/Schedule';
import SettingsPage from './features/dashboard/Settings';
import UserManagement from './features/dashboard/UserManagement';

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
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Routes (Dashboard) — Admin/Owner only */}
          <Route path="/dashboard" element={
            <AuthGuard requiredRole="admin">
              <DashboardLayout />
            </AuthGuard>
          }>
            <Route index element={<Overview />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="fields" element={<Fields />} />
            <Route path="users" element={<UserManagement />} />
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
