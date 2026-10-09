import { useNavigate, Link } from 'react-router-dom';
import type { FleetDashboardData } from '../../types';
import {
  Car, CheckCircle2, Clock, PlusCircle,
  Truck, Users, DollarSign, Activity, PieChart,
  Fuel, BatteryCharging, ChevronRight, Zap
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface FleetDashboardViewProps {
  data: FleetDashboardData;
}

export default function FleetDashboardView({ data }: FleetDashboardViewProps) {
  const navigate = useNavigate();

  // If no dynamic chart data was supplied, build a clean fallback from vehicles
  const chartData = data.chart_data && data.chart_data.length > 0 ? data.chart_data : [
    { type: 'Commercial Fleet', total: data.total_vehicles, active: data.assigned_vehicles + data.in_transit, util: `${data.fleet_utilization}%` }
  ];

  return (
    <div className="space-y-6">
      {/* Fleet Operations Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Fleet Operations Workspace
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">{data.company_name} ({data.city || 'Salem'})</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Commercial Fleet Telemetry & Utilization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor verified vehicles, assign certified drivers, and track corridor transport earnings.
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
            onClick={() => navigate('/fleet?action=register')}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Total Fleet Assets</div>
          <div className="text-2xl font-bold text-slate-900">
            {data.total_vehicles} <span className="text-xs font-normal text-slate-400">Vehicles</span>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            {data.ev_vehicles} EV · {data.diesel_vehicles} Diesel · {data.petrol_vehicles} Petrol
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Available for Dispatch</div>
          <div className="text-2xl font-bold text-emerald-700">
            {data.available_vehicles} <span className="text-xs font-normal text-slate-400">Ready</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {data.total_vehicles > 0 ? `${((data.available_vehicles / data.total_vehicles) * 100).toFixed(0)}% ready` : '0% ready'}
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Currently In Transit</div>
          <div className="text-2xl font-bold text-blue-700">
            {data.in_transit} <span className="text-xs font-normal text-slate-400">Active</span>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            {data.assigned_vehicles} additional assigned
          </div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Fleet Utilization Rate</div>
          <div className="text-2xl font-bold text-amber-700">{data.fleet_utilization}%</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">
            {data.completed_deliveries} delivered trips
          </div>
        </div>
      </div>

      {/* Performance & Revenue Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Net Carrier Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{Number(data.net_earnings).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Net earnings after transparent 5% DRIVA Service Fee</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Gross Freight: ₹{Number(data.gross_earnings).toLocaleString('en-IN')}</span>
            <span className="text-blue-600 font-medium">5% DRIVA Service Fee: ₹{Number(data.driva_service_fee).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Driver Readiness</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.available_drivers} / {data.total_drivers}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Commercial pilots ready for dispatch</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-emerald-600 font-medium">● {data.available_drivers} Available</span>
            <span className="text-slate-400">● {Math.max(0, data.total_drivers - data.available_drivers)} On Duty / Break</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Vehicle Reliability Index</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">98.6%</div>
          <p className="text-[11px] text-slate-400 mt-1">Average rating across verified platform deliveries</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Completed Deliveries: {data.completed_deliveries}</span>
            <span className="text-emerald-600 font-medium">Verified Active</span>
          </div>
        </div>
      </div>

      {/* Utilization Chart & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Vehicle Type Utilization & Dispatch Split</h3>
              <p className="text-[11px] text-slate-400">Active vs Total chassis allocation by commercial category</p>
            </div>
            <Link to="/fleet" className="text-xs text-blue-700 hover:underline font-semibold">
              Manage Fleet →
            </Link>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="Total Registered" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" name="Active / Assigned" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Fleet Actions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Fleet Operations</h3>
            <span className="badge badge-blue">Ready</span>
          </div>
          <div className="card-body space-y-2">
            {[
              { label: 'View Vehicle Registry', desc: `${data.total_vehicles} commercial assets`, to: '/fleet' },
              { label: 'Register Vehicle', desc: 'Add new commercial chassis', to: '/fleet?action=register' },
              { label: 'Driver Directory', desc: `${data.total_drivers} certified commercial drivers`, to: '/fleet?tab=drivers' },
              { label: 'Fleet Financials', desc: 'Net earnings and fee ledger', to: '/fleet?tab=earnings' },
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
