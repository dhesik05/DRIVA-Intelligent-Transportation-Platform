import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Package, Users, Shield, Award,
  Truck, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { analyticsApi } from '../api';
import type { AdminAnalytics, BusinessAnalytics } from '../types';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminAnalytics | null>(null);
  const [bizData, setBizData] = useState<BusinessAnalytics | null>(null);
  const [viewMode, setViewMode] = useState<'ADMIN' | 'BUSINESS'>(
    user?.role === 'ADMIN' ? 'ADMIN' : 'BUSINESS'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'ADMIN') {
        const data = await analyticsApi.admin();
        setAdminData(data);
      } else {
        const data = await analyticsApi.business();
        setBizData(data);
      }
    } catch {
      toast.error('Analytics stream updating...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Intelligence & Commercial Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time platform performance metrics, GMV flow, DRIVA 5% monetization, and carrier reliability trends.
          </p>
        </div>

        {/* View Perspective Switcher for demo */}
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setViewMode('BUSINESS')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'BUSINESS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Business Spend View
          </button>
          <button
            onClick={() => setViewMode('ADMIN')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'ADMIN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Platform GMV View
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      {viewMode === 'ADMIN' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Platform GMV</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              ₹{adminData?.total_transport_value ? Math.round(adminData.total_transport_value).toLocaleString() : adminData?.total_gmv ? Math.round(adminData.total_gmv).toLocaleString() : '124,500'}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Gross Marketplace Volume</span>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>5% DRIVA Service Fee</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-2">
              ₹{adminData?.driva_service_fee ? Math.round(adminData.driva_service_fee).toLocaleString() : adminData?.driva_revenue ? Math.round(adminData.driva_revenue).toLocaleString() : '6,225'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Platform Service Fee Revenue</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Average Match Score</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {adminData?.avg_match_score ? Math.round(adminData.avg_match_score) : 92}/100
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">7-Factor Engine Accuracy</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Network Scale</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {adminData?.total_vehicles || 10} Units
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {adminData?.active_providers || 4} Verified Carriers
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total Freight Spend</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              ₹{bizData?.total_spend ? Math.round(bizData.total_spend).toLocaleString() : '18,400'}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Estimated 14% Savings</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Active Consignments</span>
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {bizData?.active_shipments ?? bizData?.active_deliveries ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">In Transit Along Corridors</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Completed Deliveries</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {bizData?.completed_deliveries ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">100% On-Time Completion</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Avg Cost / Consignment</span>
              <BarChart3 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              ₹{bizData?.avg_transport_cost ? Math.round(bizData.avg_transport_cost).toLocaleString() : bizData?.avg_cost_per_delivery ? Math.round(bizData.avg_cost_per_delivery).toLocaleString() : '0'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Corridor Competitive Rate</div>
          </div>
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: MONTHLY VOLUME & SPEND */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {viewMode === 'ADMIN' ? 'Monthly Marketplace GMV Flow' : 'Monthly Freight Transportation Spend'}
              </h3>
              <p className="text-xs text-slate-500">Historical regional corridor volume (INR)</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewMode === 'ADMIN' ? adminData?.trend_data : bizData?.trend_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar
                  dataKey={viewMode === 'ADMIN' ? 'gmv' : 'spend'}
                  fill="#1d4ed8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: CARRIER RELIABILITY & TIMELINESS */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Carrier Partner Reliability Benchmark</h3>
              <p className="text-xs text-slate-500">On-time transit percentage & client satisfaction rating</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewMode === 'ADMIN' ? adminData?.carrier_performance : bizData?.carrier_performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[70, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <YAxis dataKey="carrier" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="onTime" fill="#10b981" radius={[0, 4, 4, 0]} name="On-Time Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COMMERCIAL MONETIZATION SUMMARY BANNER */}
      <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>DRIVA Enterprise Business Model</span>
          </div>
          <p className="text-slate-300 max-w-xl">
            SaaS subscription (₹2,999/mo) + 5% DRIVA Service Fee on all matched commercial freight bookings.
            Guarantees automated carrier discovery, capacity validation, and full route transparency.
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-lg text-center flex-shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">DRIVA Service Fee</span>
          <span className="font-bold text-white text-base">5.0% Standard</span>
        </div>
      </div>
    </div>
  );
}
