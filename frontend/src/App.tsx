import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import SmartMatch from './pages/SmartMatch';
import Bookings from './pages/Bookings';
import Tracking from './pages/Tracking';
import Fleet from './pages/Fleet';
import Analytics from './pages/Analytics';
import AiAssistant from './pages/AiAssistant';
import Settings from './pages/Settings';
import AdminEntities from './pages/AdminEntities';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '12px',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Primary Enterprise Hubs */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/create-request" element={<AppLayout><CreateRequest /></AppLayout>} />
          <Route path="/my-requests" element={<AppLayout><MyRequests /></AppLayout>} />
          <Route path="/smart-matches" element={<AppLayout><MyRequests /></AppLayout>} />
          <Route path="/matching/:requestId" element={<AppLayout><SmartMatch /></AppLayout>} />
          <Route path="/bookings" element={<AppLayout><Bookings /></AppLayout>} />
          <Route path="/history" element={<AppLayout><Bookings /></AppLayout>} />
          <Route path="/tracking" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/active-deliveries" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/tracking/:bookingId" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/fleet" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/spend-savings" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/ai-assistant" element={<AppLayout><AiAssistant /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

          {/* Dedicated Fleet Owner Operational Sub-Routes */}
          <Route path="/fleet/vehicles" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/fleet/availability" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/fleet/allocation" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/fleet/requests" element={<AppLayout><MyRequests /></AppLayout>} />
          <Route path="/fleet/jobs" element={<AppLayout><Bookings /></AppLayout>} />
          <Route path="/fleet/deliveries" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/fleet/drivers" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/fleet/utilization" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/fleet/earnings" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/fleet/analytics" element={<AppLayout><Analytics /></AppLayout>} />

          {/* Dedicated Logistics Agency Brokerage Sub-Routes */}
          <Route path="/agency" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/agency/requests" element={<AppLayout><MyRequests /></AppLayout>} />
          <Route path="/agency/capacity" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/agency/matching" element={<AppLayout><MyRequests /></AppLayout>} />
          <Route path="/agency/bookings" element={<AppLayout><Bookings /></AppLayout>} />
          <Route path="/agency/shipments" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/agency/partners" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/agency/drivers" element={<AppLayout><Fleet /></AppLayout>} />
          <Route path="/agency/customers" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/agency/performance" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/agency/revenue" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/agency/reliability" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/agency/analytics" element={<AppLayout><Analytics /></AppLayout>} />

          {/* Dedicated Driver Cockpit Sub-Routes */}
          <Route path="/driver" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/driver/jobs" element={<AppLayout><Bookings /></AppLayout>} />
          <Route path="/driver/active" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/driver/route" element={<AppLayout><Tracking /></AppLayout>} />
          <Route path="/driver/history" element={<AppLayout><Bookings /></AppLayout>} />
          <Route path="/driver/earnings" element={<AppLayout><Analytics /></AppLayout>} />

          {/* Dedicated Admin Governance Sub-Routes */}
          <Route path="/admin" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/admin/users" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/businesses" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/providers" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/fleets" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/agencies" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/fleet" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/drivers" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/vehicles" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/bookings" element={<AppLayout><AdminEntities /></AppLayout>} />
          <Route path="/admin/requests" element={<AppLayout><MyRequests /></AppLayout>} />
          <Route path="/admin/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/admin/revenue" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/admin/service-fee" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/admin/health" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/admin/verification" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/admin/notifications" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/admin/reports" element={<AppLayout><Analytics /></AppLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
