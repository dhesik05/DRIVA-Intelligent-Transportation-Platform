import { Link, useNavigate } from 'react-router-dom';
import type { AdminAnalytics } from '../../types';
import {
  Shield, Users, Building2, Truck, Car, Package,
  DollarSign, CreditCard, Activity, CheckCircle2,
  Server, AlertTriangle, ArrowRight, RefreshCw, Cpu
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminDashboardViewProps {
  analytics: AdminAnalytics | null;
}

const revenueData = [
  { month: 'Jul', gmv: 280000, fee: 14000 },
  { month: 'Aug', gmv: 390000, fee: 19500 },
  { month: 'Sep', gmv: 480000, fee: 24000 },
  { month: 'Oct', gmv: 590000, fee: 29500 },
];

export default function AdminDashboardView({ analytics: aa }: AdminDashboardViewProps) {
  const navigate = useNavigate();

  const totalGmv = aa?.total_gmv || 1740000;
  const drivaRevenue = aa?.driva_revenue || 87000;

  return (
    <div className="space-y-6">
      {/* Platform Administration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              Platform Administration
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Executive Governance Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            DRIVA Platform Operations & Revenue Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide network health, transaction volumes, carrier verifications, and 5% DRIVA Service Fee revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-secondary text-xs"
          >
            User Directory
          </button>
          <button
            onClick={() => navigate('/admin/service-fee')}
            className="btn-primary text-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Service Fee Ledger</span>
          </button>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="bg-slate-900 text-white p-3.5 rounded-lg border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">System Status: 99.98% SLA</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>FastAPI Backend: Healthy (14ms latency)</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 hidden sm:flex">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scikit-Learn ML Engines: Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>Corridors: 6 Active</span>
          <span>·</span>
          <span>Fee Model: Transparent 5%</span>
        </div>
      </div>

      {/* Core Platform Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Total Platform Users</div>
          <div className="text-2xl font-bold text-slate-900">{aa?.total_users ?? 38}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Multi-tenant accounts</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Registered Businesses</div>
          <div className="text-2xl font-bold text-slate-900">{aa?.total_businesses ?? 14}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Active enterprise shippers</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Verified Fleet Carriers</div>
          <div className="text-2xl font-bold text-slate-900">{aa?.active_providers ?? 12}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">{aa?.total_vehicles ?? 34} registered vehicles</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Total Consignments</div>
          <div className="text-2xl font-bold text-slate-900">{aa?.total_bookings ?? 68}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Avg Match Score: {aa?.avg_match_score ? `${aa.avg_match_score.toFixed(1)}` : '91.2'}</div>
        </div>
      </div>

      {/* Financials & DRIVA Service Fee Highlight Card */}
      <div className="card border-blue-200 bg-linear-to-b from-blue-50/50 to-white">
        <div className="card-header border-b border-blue-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">DRIVA Platform Revenue & Financial Settlements</h3>
            <p className="text-[11px] text-slate-500">Transparent 5% DRIVA Service Fee model (zero broker markup)</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            5.0% Fixed Platform Fee
          </span>
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center py-2">
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Transportation GMV</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{totalGmv.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Gross Freight Value Transacted</div>
            </div>

            <div className="p-4 rounded-lg bg-blue-600 text-white shadow-xs">
              <div className="text-xs text-blue-100 uppercase tracking-wider mb-1">DRIVA Service Fee (5%)</div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹{drivaRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-blue-100 mt-1">Platform Software & Allocation Revenue</div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Average Consignment Value</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{(aa?.avg_booking_value || 6282).toFixed(0)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Service Fee per trip: ~₹314.13</div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart & Governance Table */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Quarterly GMV & Service Fee Trajectory</h3>
              <p className="text-[11px] text-slate-400">Total freight transacted vs net 5% DRIVA software revenue</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-blue-700 hover:underline font-semibold">
              Financial Breakdown →
            </Link>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="gmv" name="Transportation GMV" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fee" name="DRIVA Service Fee (5%)" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carrier Verification Queue */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Carrier Verification Queue</h3>
            <span className="badge badge-amber">2 Pending</span>
          </div>
          <div className="card-body space-y-2.5">
            {[
              { name: 'Kavitha Transport', hub: 'Erode Hub', trucks: '6 Trucks', docs: 'GST + Permit OK' },
              { name: 'BlueDart Regional Sub', hub: 'Hosur Dock', trucks: '12 Vans', docs: 'Under Review' },
            ].map((carrier, idx) => (
              <div key={idx} className="p-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                  <span>{carrier.name}</span>
                  <span className="text-[10px] text-amber-700 font-bold">Audit</span>
                </div>
                <div className="text-[11px] text-slate-500">{carrier.hub} · {carrier.trucks}</div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60 text-[10px]">
                  <span className="text-slate-400">{carrier.docs}</span>
                  <button
                    onClick={() => navigate('/admin/verification')}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Approve →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
