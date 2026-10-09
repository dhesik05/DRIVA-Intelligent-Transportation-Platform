import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DriverDashboardData } from '../../types';
import {
  Navigation, MapPin, Truck, Clock, ShieldCheck,
  CheckCircle2, AlertCircle, Phone, ArrowRight,
  DollarSign, BatteryCharging, FileText, Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DriverDashboardViewProps {
  data: DriverDashboardData;
}

export default function DriverDashboardView({ data }: DriverDashboardViewProps) {
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState<string>(
    data.active_delivery?.status || 'IN_TRANSIT'
  );

  const advanceStatus = () => {
    if (jobStatus === 'PICKUP_PENDING' || jobStatus === 'CONFIRMED' || jobStatus === 'DRIVER_ASSIGNED') {
      setJobStatus('IN_TRANSIT');
      toast.success('Pickup marked complete! En route to destination.');
    } else if (jobStatus === 'IN_TRANSIT') {
      setJobStatus('DELIVERED');
      toast.success('Consignment delivered successfully! Proof-of-delivery logged.');
    } else {
      setJobStatus('IN_TRANSIT');
      toast('Status updated');
    }
  };

  const activeJob = data.active_delivery;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Driver Cockpit Header */}
      <div className="bg-slate-900 text-white rounded-lg p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
              Commercial Pilot Cockpit
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {data.is_available ? 'Ready for Dispatch' : 'On Active Duty'} ({data.current_location})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {data.driver_name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Vehicle: <span className="text-white font-semibold">{data.assigned_vehicle?.type || 'Tata Ace'}</span> ({data.assigned_vehicle?.registration || 'TN 34 AB 1234'}) · {data.assigned_vehicle?.capacity_kg || 750} kg Max
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase">Total Career Earnings</div>
            <div className="text-xl font-black text-emerald-400">₹{Number(data.gross_earnings).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Hero Active Mission Card */}
      {activeJob ? (
        <div className="card border-2 border-blue-600/40 shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4 animate-spin" />
              <span>Active Consignment Mission #{activeJob.booking_id}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
              PAYOUT: ₹{Number(activeJob.payout).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Corridor Waypoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-md border border-slate-200">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>ORIGIN</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{activeJob.origin}</div>
                <div className="text-xs text-slate-600 mt-0.5">Dispatch Hub / Pickup Location</div>
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>DESTINATION</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{activeJob.destination}</div>
                <div className="text-xs text-slate-600 mt-0.5">Consignment Delivery Destination</div>
              </div>
            </div>

            {/* Cargo & Vehicle Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Cargo Category</div>
                <div className="font-bold text-slate-800 mt-0.5">{activeJob.cargo_type}</div>
                <div className="text-[10px] text-slate-500">Commercial consignment</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Cargo Weight</div>
                <div className="font-bold text-slate-800 mt-0.5">{activeJob.cargo_weight_kg} kg</div>
                <div className="text-[10px] text-slate-500">Vehicle cap: {data.assigned_vehicle?.capacity_kg} kg</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Estimated ETA</div>
                <div className="font-bold text-emerald-700 mt-0.5">~{activeJob.eta_hours} Hours</div>
                <div className="text-[10px] text-emerald-600">On-Time Transit</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Trip Payout</div>
                <div className="font-bold text-blue-700 mt-0.5">₹{Number(activeJob.payout).toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-500">Total freight: ₹{Number(activeJob.quoted_price).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Status Progress State */}
            <div className="p-3 bg-blue-50/60 rounded-md border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900">Current Trip Status</span>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {jobStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                <div className={`py-1.5 rounded ${jobStatus !== 'IN_TRANSIT' && jobStatus !== 'DELIVERED' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                  1. Pickup Assigned
                </div>
                <div className={`py-1.5 rounded ${jobStatus === 'IN_TRANSIT' ? 'bg-blue-600 text-white' : jobStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}`}>
                  2. Highway Transit
                </div>
                <div className={`py-1.5 rounded ${jobStatus === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  3. Delivered
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate('/tracking')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Launch Live GPS Map</span>
              </button>

              <button
                onClick={advanceStatus}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Delivery Status</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center border-dashed border-2 border-slate-300">
          <Truck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Active Mission Dispatched</h3>
          <p className="text-xs text-slate-500 mt-1">You are currently available for corridor allocation.</p>
        </div>
      )}

      {/* Driver Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">License & Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 font-mono">{data.license_number}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{data.experience_years} Years Commercial Experience</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">Completed Trips</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{data.completed_jobs} Deliveries</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Rating: {data.rating} ★ Customer Satisfaction</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">Mission Status</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-emerald-700">{data.todays_jobs} Active Jobs</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Availability: {data.is_available ? 'Available' : 'Assigned'}</p>
        </div>
      </div>
    </div>
  );
}
