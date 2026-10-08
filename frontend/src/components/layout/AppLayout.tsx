import { useState, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import NavigationSidebar from '../navigation/NavigationSidebar';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Bell, User, Briefcase, MapPin, Navigation, DollarSign, Settings as SettingsIcon } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Automatically close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading DRIVA Workspace...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isDriver = user?.role === 'DRIVER';

  const roleTitles: Record<string, string> = {
    BUSINESS_OWNER: 'Procurement',
    FLEET_OWNER: 'Fleet Operations',
    LOGISTICS_AGENCY: 'Agency Network',
    DRIVER: 'Driver Cockpit',
    ADMIN: 'Admin Console',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Dynamic Role-Based Sidebar (Desktop + Mobile Drawer) */}
      <NavigationSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile / Tablet Top Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-white z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 focus:outline-hidden"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
              <img src="/logo.png" alt="DRIVA" className="w-7 h-7 rounded bg-white p-0.5 object-contain" />
              <span className="font-extrabold text-sm tracking-tight">DRIVA</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-900 text-blue-300 border border-blue-700">
                {roleTitles[user.role] || 'B2B'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="p-1.5 text-slate-400 hover:text-white rounded-md"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <div
              onClick={() => navigate('/settings')}
              className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className={`flex-1 overflow-y-auto ${isDriver ? 'pb-20 md:pb-6' : ''}`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Quick-Action Bar for Drivers */}
        {isDriver && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex justify-around py-1.5 px-2">
            {[
              { to: '/driver/jobs', icon: Briefcase, label: 'Jobs' },
              { to: '/driver/active', icon: MapPin, label: 'Active' },
              { to: '/driver/route', icon: Navigation, label: 'Route' },
              { to: '/driver/earnings', icon: DollarSign, label: 'Earnings' },
              { to: '/settings', icon: User, label: 'Profile' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.to;
              return (
                <button
                  key={tab.to}
                  onClick={() => navigate(tab.to)}
                  className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-medium transition-colors ${
                    isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
