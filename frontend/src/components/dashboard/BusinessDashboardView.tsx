import { Link, useNavigate } from 'react-router-dom';
import type { BusinessDashboardData } from '../../types';
import {
  Package, MapPin, TrendingUp, Clock, PlusCircle,
  Sparkles, ChevronRight, ShieldCheck, DollarSign,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BusinessDashboardViewProps {
  data: BusinessDashboardData;
  userName?: string;
}

const statusColor: Record<string, string> = {
  PENDING: 'badge-slate',
  MATCHING: 'badge-amber',
  MATCHED: 'badge-blue',
  BOOKED: 'badge-green',
  CANCELLED: 'badge-red',
};

const priorityColor: Record<string, string> = {
  LOW: 'badge-slate',
  NORMAL: 'badge-blue',
  HIGH: 'badge-amber',
  URGENT: 'badge-red',
};

export default function BusinessDashboardView({ data, userName }: BusinessDashboardViewProps) {
  const navigate = useNavigate();

  const monthlyData = data.trend_data && data.trend_data.length > 0 ? data.trend_data : [
    { month: 'Jul', spend: Math.round(data.total_spend * 0.15), savings: Math.round(data.total_spend * 0.02) },
    { month: 'Aug', spend: Math.round(data.total_spend * 0.25), savings: Math.round(data.total_spend * 0.035) },
    { month: 'Sep', spend: Math.round(data.total_spend * 0.28), savings: Math.round(data.total_spend * 0.04) },
    { month: 'Oct', spend: Math.round(data.total_spend * 0.32), savings: Math.round(data.total_spend * 0.045) },
  ];

  return (
    <div className="space-y-6">
      {/* Procurement Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Procurement Workspace
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Southern Freight Corridors</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {userName?.split(' ')[0] || 'Shipper'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate freight requirements, inspect ML Smart Matches, and dispatch carrier consignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/my-requests')}
            className="btn-secondary text-xs"
          >
            My Requests
          </button>
          <button
            onClick={() => navigate('/create-request')}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transport Request</span>
          </button>
        </div>
      </div>

      {/* Recommended Transport Alert Banner */}
      <div className="bg-linear-to-r from-blue-900 to-slate-900 rounded-lg p-4 text-white shadow-xs border border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 mt-0.5">
            <Sparkles className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">ML Recommendation Ready</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
                94.2 Match Score
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-0.5">
              Salem → Bangalore (340 km) · ABC Logistics (EV Cargo Van)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Predicted cost: ₹3,141 · Transit: 6.1 hrs · Payload utilization: 25.0% · 5% DRIVA Service Fee included
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/smart-matches')}
          className="px-3.5 py-2 rounded-md bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 self-end sm:self-center"
        >
          <span>Review Candidate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Procurement KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_requests}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>Procurement demands</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Active Shipments</div>
          <div className="text-2xl font-bold text-slate-900">{data.active_shipments}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>En route corridor</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Completed Deliveries</div>
          <div className="text-2xl font-bold text-slate-900">{data.completed_deliveries}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Delivered consignments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Total Spend</div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{Number(data.total_spend).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Audited freight</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Avg Transport Cost</div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{Number(data.avg_transport_cost).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Per delivery</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Avg Match Score</div>
          <div className="text-2xl font-bold text-blue-700">{data.avg_match_score}<span className="text-xs text-slate-400">/100</span></div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">7-factor weighted</div>
        </div>
      </div>

      {/* Middle Section: Spend Analytics & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Transportation Spend & Model Efficiency</h3>
              <p className="text-[11px] text-slate-400">Audited freight expenditure and direct procurement savings</p>
            </div>
            <Link to="/analytics" className="text-xs text-blue-700 hover:underline font-semibold">
              Full Analytics →
            </Link>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="spend" name="Spend" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="DRIVA Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Procurement Shortcuts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-800">Procurement Actions</h3>
          </div>
          <div className="card-body space-y-2">
            {[
              { label: 'Create Transport Request', desc: '4-step ML procurement wizard', to: '/create-request', primary: true },
              { label: 'View Smart Matches', desc: 'Ranked candidate carriers', to: '/smart-matches', primary: false },
              { label: 'Track Active Delivery', desc: 'Live OpenStreetMap GPS', to: '/tracking', primary: false },
              { label: 'Consignment Bookings', desc: 'Waybills & 5% service fee', to: '/bookings', primary: false },
              { label: 'AI Transportation Copilot', desc: 'Decision trade-off analysis', to: '/ai-assistant', primary: false },
            ].map(({ label, desc, to, primary }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center justify-between p-2.5 rounded-md text-xs transition-all border ${
                  primary
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 font-semibold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className={`text-[10px] ${primary ? 'text-blue-100' : 'text-slate-400'}`}>{desc}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-80" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      {data.recent_requests && data.recent_requests.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Procurement Requests</h3>
              <p className="text-[11px] text-slate-400">Live corridor status and ML match evaluation</p>
            </div>
            <Link to="/my-requests" className="text-xs text-blue-700 hover:underline font-semibold">
              View All Requests →
            </Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Corridor Route</th>
                  <th>Cargo Category</th>
                  <th>Weight (kg)</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_requests.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold text-slate-900">{r.pickup_location} → {r.destination}</div>
                      {r.estimated_distance_km && <div className="text-[11px] text-slate-400 font-mono">{r.estimated_distance_km} km</div>}
                    </td>
                    <td>{r.cargo_type}</td>
                    <td className="font-mono font-medium">{r.cargo_weight_kg} kg</td>
                    <td><span className={`badge ${priorityColor[r.priority]}`}>{r.priority}</span></td>
                    <td><span className={`badge ${statusColor[r.status]}`}>{r.status}</span></td>
                    <td className="text-slate-500 text-xs">{new Date(r.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'MATCHED' || r.status === 'PENDING' ? (
                        <Link to={`/matching/${r.id}`} className="text-xs text-blue-700 hover:underline font-bold">
                          View Match →
                        </Link>
                      ) : (
                        <Link to="/my-requests" className="text-xs text-slate-500 hover:underline">
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
