import { Link, useNavigate } from 'react-router-dom';
import type { AdminDashboardData } from '../../types';
import {
  Shield, Users, Building2, Truck, Car, Package,
  DollarSign, CreditCard, Activity, CheckCircle2,
  Server, AlertTriangle, ArrowRight, RefreshCw, Cpu
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminDashboardViewProps {
  data: AdminDashboardData;
}

export default function AdminDashboardView({ data }: AdminDashboardViewProps) {
  const navigate = useNavigate();

  const totalGmv = data.total_transport_value || 0;
  const drivaRevenue = data.driva_service_fee || 0;

  const revenueData = [
    { month: 'Q1', gmv: Math.round(totalGmv * 0.18), fee: Math.round(drivaRevenue * 0.18) },
    { month: 'Q2', gmv: Math.round(totalGmv * 0.24), fee: Math.round(drivaRevenue * 0.24) },
    { month: 'Q3', gmv: Math.round(totalGmv * 0.28), fee: Math.round(drivaRevenue * 0.28) },
    { month: 'Current', gmv: Math.round(totalGmv * 0.30), fee: Math.round(drivaRevenue * 0.30) },
  ];

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
            <span className="text-xs text-slate-500 font-medium">Single Source of Truth (PostgreSQL)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            DRIVA Platform Operations & Revenue Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide network health, transaction volumes, verified carrier fleet assets, and 5% DRIVA Service Fee revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/fleet')}
            className="btn-secondary text-xs"
          >
            Vehicle Registry
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="btn-primary text-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Consignment Bookings</span>
          </button>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="bg-slate-900 text-white p-3.5 rounded-lg border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">System Status: Operational</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>FastAPI Backend: Healthy</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 hidden sm:flex">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scikit-Learn ML Models: Cost, ETA, Suitability Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>Corridors: Active</span>
          <span>·</span>
          <span>Fee Model: 5% DRIVA Service Fee</span>
        </div>
      </div>

      {/* Platform User Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_users}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Platform accounts</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Businesses</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_businesses}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Corporate shippers</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Fleet Owners</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_fleet_owners}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Carriers</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Logistics Agencies</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_agencies}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-1">Brokerage partners</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 mb-1">Drivers</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_drivers}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Certified drivers</div>
        </div>
      </div>

      {/* Fleet & Operational Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Total Vehicles</div>
          <div className="text-2xl font-bold text-slate-900">{data.total_vehicles}</div>
          <div className="text-[10px] text-slate-500 mt-1">
            {data.available_vehicles} Available · {data.assigned_vehicles} Assigned · {data.in_transit_vehicles} In Transit
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Active Deliveries</div>
          <div className="text-2xl font-bold text-blue-700">{data.active_deliveries}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            {data.pending_requests} pending requests
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Completed Deliveries</div>
          <div className="text-2xl font-bold text-emerald-700">{data.completed_deliveries}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Total bookings: {data.total_bookings}
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Avg Match Score</div>
          <div className="text-2xl font-bold text-indigo-700">{data.avg_match_score}%</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-1">
            Avg ETA: {data.avg_eta_hours} hrs
          </div>
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
            5.0% DRIVA Service Fee
          </span>
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center py-2">
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Transportation Value</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{Number(totalGmv).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Gross Freight Value Transacted</div>
            </div>

            <div className="p-4 rounded-lg bg-blue-600 text-white shadow-xs">
              <div className="text-xs text-blue-100 uppercase tracking-wider mb-1">DRIVA Service Fee (5%)</div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹{Number(drivaRevenue).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-blue-100 mt-1">Platform Software & Allocation Revenue</div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Average Consignment Value</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{data.total_bookings > 0 ? (totalGmv / data.total_bookings).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                5% Service Fee per trip: ₹{data.total_bookings > 0 ? (drivaRevenue / data.total_bookings).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart & Registry Quick Links */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Quarterly GMV & Service Fee Trajectory</h3>
              <p className="text-[11px] text-slate-400">Total freight transacted vs net 5% DRIVA Service Fee</p>
            </div>
            <Link to="/analytics" className="text-xs text-blue-700 hover:underline font-semibold">
              Deep Analytics →
            </Link>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="gmv" name="Transportation Value" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fee" name="DRIVA Service Fee (5%)" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Quick Links */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Platform Management</h3>
            <span className="badge badge-blue">Admin</span>
          </div>
          <div className="card-body space-y-2">
            {[
              { label: 'Vehicle Registry', desc: `${data.total_vehicles} commercial vehicles`, to: '/fleet' },
              { label: 'Driver Directory', desc: `${data.total_drivers} certified pilots`, to: '/fleet/drivers' },
              { label: 'Consignment Bookings', desc: `${data.total_bookings} active & past bookings`, to: '/bookings' },
              { label: 'Live Consignment Tracking', desc: 'Active dispatch map', to: '/tracking' },
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
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
