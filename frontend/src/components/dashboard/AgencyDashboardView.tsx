import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Truck, ClipboardList, Sparkles, MapPin,
  CheckCircle2, DollarSign, Activity, Users, Star,
  TrendingUp, ChevronRight, Package, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const agencyVolumeData = [
  { corridor: 'Salem-BLR', shipments: 48, revenue: 142000 },
  { corridor: 'CHN-BLR', shipments: 38, revenue: 128000 },
  { corridor: 'CBE-BLR', shipments: 26, revenue: 89000 },
  { corridor: 'MDU-BLR', shipments: 18, revenue: 64000 },
];

export default function AgencyDashboardView() {
  const navigate = useNavigate();

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
            <span className="text-xs text-slate-500 font-medium">SouthLine Freight Brokerage</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Regional Shipment Operations & Partner Network
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate freight demands with partner fleet capacity, oversee active shipments, and monitor brokerage margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/agency/requests')}
            className="btn-secondary text-xs"
          >
            Pending Requests
          </button>
          <button
            onClick={() => navigate('/agency/matching')}
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
          <div className="text-xs text-slate-500 mb-1">Open Transport Opportunities</div>
          <div className="text-2xl font-bold text-slate-900">8 <span className="text-xs font-normal text-slate-400">Loads</span></div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Ready for carrier match</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Available Fleet Capacity</div>
          <div className="text-2xl font-bold text-emerald-700">28 <span className="text-xs font-normal text-slate-400">Trucks</span></div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Across 6 partner carriers</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">Active Shipments In Transit</div>
          <div className="text-2xl font-bold text-blue-700">14 <span className="text-xs font-normal text-slate-400">Consignments</span></div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Live telemetry tracked</div>
        </div>

        <div className="stat-card col-span-2">
          <div className="text-xs text-slate-500 mb-1">On-Time Delivery SLA</div>
          <div className="text-2xl font-bold text-purple-700">98.4%</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">142 deliveries completed</div>
        </div>
      </div>

      {/* Financial & Customer Trust Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Agency Gross Freight</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹4,23,000</div>
          <p className="text-[11px] text-slate-400 mt-1">Total brokered consignment volume this quarter</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Agency Margin: ₹42,300</span>
            <span className="text-blue-600 font-medium">DRIVA Fee (5%): ₹21,150</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Corporate Customer Score</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">4.9 / 5.0</div>
          <p className="text-[11px] text-slate-400 mt-1">Average rating across 32 corporate shippers</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-emerald-600 font-medium">● 96% Repeat Rate</span>
            <span className="text-slate-400">● 0 Unresolved Claims</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Partner Carrier Network</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">6 Carriers</div>
          <p className="text-[11px] text-slate-400 mt-1">Verified regional logistics and fleet partners</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Total Drivers: 42</span>
            <span className="text-emerald-600 font-medium">All KYC Verified</span>
          </div>
        </div>
      </div>

      {/* Corridor Breakdown & Live Consignment Feeds */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Corridor Freight Volume & Revenue</h3>
              <p className="text-[11px] text-slate-400">Shipment distributions along major South Indian highways</p>
            </div>
            <Link to="/agency/analytics" className="text-xs text-blue-700 hover:underline font-semibold">
              Deep Analytics →
            </Link>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={agencyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="corridor" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="shipments" name="Shipments" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Matching Opportunities */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">High-Demand Corridors</h3>
            <span className="badge badge-green">Immediate Need</span>
          </div>
          <div className="card-body space-y-2.5">
            {[
              { corridor: 'Salem → Bangalore', cargo: 'Electronics (200 kg)', reward: '₹3,200', urgent: true },
              { corridor: 'Chennai → Bangalore', cargo: 'Auto Parts (850 kg)', reward: '₹7,400', urgent: false },
              { corridor: 'Coimbatore → Chennai', cargo: 'Textile Rolls (1.2 MT)', reward: '₹9,800', urgent: true },
            ].map((opp, idx) => (
              <div key={idx} className="p-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                  <span>{opp.corridor}</span>
                  <span className="font-mono text-emerald-700 font-bold">{opp.reward}</span>
                </div>
                <div className="text-[11px] text-slate-500">{opp.cargo}</div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60 text-[10px]">
                  <span className={opp.urgent ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                    {opp.urgent ? '● High Priority' : 'Standard'}
                  </span>
                  <button
                    onClick={() => navigate('/agency/matching')}
                    className="text-blue-700 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>Match</span>
                    <ArrowUpRight className="w-3 h-3" />
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
