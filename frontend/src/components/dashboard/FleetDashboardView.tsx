import { useNavigate, Link } from 'react-router-dom';
import {
  Car, CheckCircle2, AlertCircle, Clock, PlusCircle,
  Truck, Users, DollarSign, Activity, PieChart,
  Fuel, BatteryCharging, ChevronRight, Zap
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const fleetUtilizationData = [
  { type: 'Tata Ace', total: 4, active: 3, util: '75%' },
  { type: 'Bolero', total: 3, active: 2, util: '67%' },
  { type: 'EV Cargo Van', total: 4, active: 4, util: '100%' },
  { type: 'Mini Truck', total: 2, active: 1, util: '50%' },
  { type: 'Medium Truck', total: 2, active: 1, util: '50%' },
];

export default function FleetDashboardView() {
  const navigate = useNavigate();

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
            <span className="text-xs text-slate-500 font-medium">ABC Logistics Fleet Partner</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Commercial Fleet Telemetry & Utilization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor commercial vehicle assets, assign certified drivers, and track corridor transport earnings.
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
          <div className="text-2xl font-bold text-slate-900">15 <span className="text-xs font-normal text-slate-400">Vehicles</span></div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">4 EV · 9 Diesel · 2 Petrol</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Available for Dispatch</div>
          <div className="text-2xl font-bold text-emerald-700">9 <span className="text-xs font-normal text-slate-400">Ready</span></div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">60.0% instant ready</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Currently In Transit</div>
          <div className="text-2xl font-bold text-blue-700">5 <span className="text-xs font-normal text-slate-400">Active</span></div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Salem ↔ Bangalore</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Fleet Utilization Rate</div>
          <div className="text-2xl font-bold text-amber-700">73.3%</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">+8.2% vs last month</div>
        </div>
      </div>

      {/* Performance & Revenue Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Carrier Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹1,48,250</div>
          <p className="text-[11px] text-slate-400 mt-1">Net earnings after transparent 5% DRIVA Service Fee</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Gross Freight: ₹1,56,050</span>
            <span className="text-blue-600 font-medium">DRIVA Fee (5%): ₹7,800</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Driver Readiness</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">12 / 14</div>
          <p className="text-[11px] text-slate-400 mt-1">Commercial pilots on active corridor duty</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-emerald-600 font-medium">● 10 On Road</span>
            <span className="text-slate-400">● 2 On Break / Rest</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Vehicle Reliability Index</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">98.6%</div>
          <p className="text-[11px] text-slate-400 mt-1">Zero breakdown rate across 128 corridor trips</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Scheduled Servicing: 1</span>
            <span className="text-emerald-600 font-medium">EV Health: 99.1%</span>
          </div>
        </div>
      </div>

      {/* Utilization Chart & Active Jobs */}
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
              <BarChart data={fleetUtilizationData}>
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

        {/* Upcoming Jobs Queue */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Dispatch Queue</h3>
            <span className="badge badge-amber">3 Pending</span>
          </div>
          <div className="card-body space-y-2.5">
            {[
              { id: 'JOB-412', route: 'Salem → Bangalore', time: 'Today 14:00', vehicle: 'EV Cargo Van (TN33AB1004)', status: 'Assigned' },
              { id: 'JOB-413', route: 'Chennai → Bangalore', time: 'Today 16:30', vehicle: 'Bolero Pickup (TN33CD2041)', status: 'Ready' },
              { id: 'JOB-414', route: 'Coimbatore → Salem', time: 'Tomorrow 08:00', vehicle: 'Tata Ace (TN33EF3088)', status: 'Pending Driver' },
            ].map((job) => (
              <div key={job.id} className="p-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                  <span>{job.route}</span>
                  <span className="font-mono text-blue-700 font-bold">{job.id}</span>
                </div>
                <div className="text-[11px] text-slate-500">{job.vehicle}</div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                  <span>{job.time}</span>
                  <span className="font-semibold text-amber-700">{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
