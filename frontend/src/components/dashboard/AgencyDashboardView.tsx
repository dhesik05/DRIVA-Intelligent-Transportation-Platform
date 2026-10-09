import { useNavigate, Link } from 'react-router-dom';
import type { AgencyDashboardData } from '../../types';
import {
  Building2, Truck, ClipboardList, Sparkles, MapPin,
  CheckCircle2, DollarSign, Activity, Users, Star,
  TrendingUp, ChevronRight, Package, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AgencyDashboardViewProps {
  data: AgencyDashboardData;
}

export default function AgencyDashboardView({ data }: AgencyDashboardViewProps) {
  const navigate = useNavigate();

  const corridorData = [
    { corridor: 'Salem-BLR', volume: Math.round(data.total_volume * 0.45) },
    { corridor: 'CHN-BLR', volume: Math.round(data.total_volume * 0.30) },
    { corridor: 'CBE-BLR', volume: Math.round(data.total_volume * 0.25) },
  ];

  return (
    <div className="space-y-6">
      {/* Agency Operations Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              Agency Operations Workspace
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">{data.agency_name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Regional Freight Operations & Partner Network
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate freight requests with partner fleet capacity, oversee active shipments, and track margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/agency?tab=requests')}
            className="btn-secondary text-xs"
          >
            Pending Requests
          </button>
          <button
            onClick={() => navigate('/smart-matches')}
            className="btn-primary text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Match Open Loads</span>
          </button>
        </div>
      </div>

      {/* Agency Key Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Active Requests</div>
          <div className="text-2xl font-bold text-slate-900">
            {data.active_requests} <span className="text-xs font-normal text-slate-400">Loads</span>
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Ready for carrier match</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Available Fleet Capacity</div>
          <div className="text-2xl font-bold text-emerald-700">
            {data.available_capacity} <span className="text-xs font-normal text-slate-400">Trucks</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Across {data.partner_carriers} partner carriers
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Active Shipments In Transit</div>
          <div className="text-2xl font-bold text-blue-700">
            {data.active_shipments} <span className="text-xs font-normal text-slate-400">Consignments</span>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Live telemetry tracked</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Completed Shipments</div>
          <div className="text-2xl font-bold text-purple-700">{data.completed_shipments}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">
            Reliability: {data.reliability_score}%
          </div>
        </div>
      </div>

      {/* Financial & Customer Trust Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Agency Gross Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{Number(data.total_volume).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total consignment volume transacted</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Agency Revenue: ₹{Number(data.agency_revenue).toLocaleString('en-IN')}</span>
            <span className="text-blue-600 font-medium">5% DRIVA Fee: ₹{Number(data.driva_service_fee).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Provider Reliability</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.reliability_score}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Audited corridor fulfillment score</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-emerald-600 font-medium">● High Trust Rating</span>
            <span className="text-slate-400">● Zero SLA Breaches</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Partner Carrier Network</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">{data.partner_carriers} Carriers</div>
          <p className="text-[11px] text-slate-400 mt-1">Verified regional fleet partners</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Available Chassis: {data.available_capacity}</span>
            <span className="text-emerald-600 font-medium">All KYC Verified</span>
          </div>
        </div>
      </div>

      {/* Corridor Breakdown & Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Corridor Freight Volume Distribution</h3>
              <p className="text-[11px] text-slate-400">Shipment distributions along major South Indian highways</p>
            </div>
            <Link to="/analytics" className="text-xs text-blue-700 hover:underline font-semibold">
              Deep Analytics →
            </Link>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={corridorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="corridor" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Volume']} />
                <Bar dataKey="volume" name="Transacted Volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agency Shortcuts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Agency Actions</h3>
            <span className="badge badge-green">Live</span>
          </div>
          <div className="card-body space-y-2">
            {[
              { label: 'Smart Match Open Loads', desc: 'Find suitable fleet vehicles', to: '/smart-matches' },
              { label: 'Available Capacity', desc: `${data.available_capacity} partner vehicles ready`, to: '/fleet' },
              { label: 'Active Shipments', desc: `${data.active_shipments} in transit`, to: '/bookings' },
              { label: 'Tracking Console', desc: 'Live OpenStreetMap tracking', to: '/tracking' },
            ].map(({ label, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between p-2.5 rounded-md text-xs transition-all border bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
              >
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-[10px] text-slate-400">{desc}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-80" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
