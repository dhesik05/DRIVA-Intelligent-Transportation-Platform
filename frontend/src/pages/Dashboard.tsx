import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { analyticsApi } from '../api';
import type { BusinessAnalytics, AdminAnalytics } from '../types';

import BusinessDashboardView from '../components/dashboard/BusinessDashboardView';
import FleetDashboardView from '../components/dashboard/FleetDashboardView';
import AgencyDashboardView from '../components/dashboard/AgencyDashboardView';
import DriverDashboardView from '../components/dashboard/DriverDashboardView';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<BusinessAnalytics | AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = isAdmin ? await analyticsApi.admin() : await analyticsApi.business();
        setAnalytics(data);
      } catch {
        // Fall back gracefully to mock / structured values
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Operational Workspace...</div>
        </div>
      </div>
    );
  }

  // Switch between dedicated role workspaces
  switch (user?.role) {
    case 'FLEET_OWNER':
      return <FleetDashboardView />;

    case 'LOGISTICS_AGENCY':
      return <AgencyDashboardView />;

    case 'DRIVER':
      return <DriverDashboardView />;

    case 'ADMIN':
      return <AdminDashboardView analytics={analytics as AdminAnalytics} />;

    case 'BUSINESS_OWNER':
    default:
      return <BusinessDashboardView analytics={analytics as BusinessAnalytics} userName={user?.name} />;
  }
}
