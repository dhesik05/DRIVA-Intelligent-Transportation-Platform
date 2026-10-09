import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardApi } from '../api';
import type {
  BusinessDashboardData,
  FleetDashboardData,
  AgencyDashboardData,
  DriverDashboardData,
  AdminDashboardData,
  DashboardSummary,
} from '../types';

import BusinessDashboardView from '../components/dashboard/BusinessDashboardView';
import FleetDashboardView from '../components/dashboard/FleetDashboardView';
import AgencyDashboardView from '../components/dashboard/AgencyDashboardView';
import DriverDashboardView from '../components/dashboard/DriverDashboardView';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: DashboardSummary;
      switch (user?.role) {
        case 'FLEET_OWNER':
          res = await dashboardApi.fleet();
          break;
        case 'LOGISTICS_AGENCY':
          res = await dashboardApi.agency();
          break;
        case 'DRIVER':
          res = await dashboardApi.driver();
          break;
        case 'ADMIN':
          res = await dashboardApi.admin();
          break;
        case 'BUSINESS_OWNER':
        default:
          res = await dashboardApi.business();
          break;
      }
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.response?.data?.detail || err?.message || 'Unable to connect to DRIVA analytics backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Live Operational Telemetry...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-rose-900 mb-1">Failed to load dashboard metrics</h3>
        <p className="text-xs text-rose-700 mb-4">{error || 'No database records received from API.'}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Switch between dedicated role workspaces using real database responses
  switch (user?.role) {
    case 'FLEET_OWNER':
      return <FleetDashboardView data={data as FleetDashboardData} />;

    case 'LOGISTICS_AGENCY':
      return <AgencyDashboardView data={data as AgencyDashboardData} />;

    case 'DRIVER':
      return <DriverDashboardView data={data as DriverDashboardData} />;

    case 'ADMIN':
      return <AdminDashboardView data={data as AdminDashboardData} />;

    case 'BUSINESS_OWNER':
    default:
      return <BusinessDashboardView data={data as BusinessDashboardData} userName={user?.name} />;
  }
}
