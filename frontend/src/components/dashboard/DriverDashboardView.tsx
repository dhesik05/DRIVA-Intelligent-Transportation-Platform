import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation, MapPin, Truck, Clock, ShieldCheck,
  CheckCircle2, AlertCircle, Phone, ArrowRight,
  DollarSign, BatteryCharging, FileText, Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverDashboardView() {
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState<'PICKUP_PENDING' | 'IN_TRANSIT' | 'DELIVERED'>('IN_TRANSIT');

  const advanceStatus = () => {
    if (jobStatus === 'PICKUP_PENDING') {
      setJobStatus('IN_TRANSIT');
      toast.success('Pickup marked complete! En route to Bangalore.');
    } else if (jobStatus === 'IN_TRANSIT') {
      setJobStatus('DELIVERED');
      toast.success('Consignment delivered successfully! Proof-of-delivery logged.');
    } else {
      setJobStatus('PICKUP_PENDING');
      toast('Reset demo job status');
    }
  };

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
              On Duty (NH44 Active)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Karthik V
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Vehicle: <span className="text-white font-semibold">EV Cargo Van</span> (TN-33-AB-1004) · 800 kg Max
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase">Today's Payout</div>
            <div className="text-xl font-black text-emerald-400">₹2,984.24</div>
          </div>
        </div>
      </div>

      {/* Hero Active Mission Card */}
      <div className="card border-2 border-blue-600/40 shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin" />
            <span>Active Consignment Mission #BK-8842</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
            HIGH PRIORITY
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Corridor Waypoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>PICKUP LOCATION</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Salem Industrial Hub</div>
              <div className="text-xs text-slate-600 mt-0.5">Plot 42, Omalur Main Road, Salem</div>
              <div className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>Contact: Rajan (+91 98765 43210)</span>
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>DESTINATION</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Bangalore Electronics City</div>
              <div className="text-xs text-slate-600 mt-0.5">Phase 1 Logistics Dock 4, Bangalore</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>Receiver: Anand (+91 94432 10987)</span>
              </div>
            </div>
          </div>

          {/* Cargo & Vehicle Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase">Cargo Category</div>
              <div className="font-bold text-slate-800 mt-0.5">Electronics</div>
              <div className="text-[10px] text-slate-500">Delicate / Dry van</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase">Weight & Envelope</div>
              <div className="font-bold text-slate-800 mt-0.5">200 kg</div>
              <div className="text-[10px] text-slate-500">2.5m × 1.5m × 1.2m</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase">Deadline Horizon</div>
              <div className="font-bold text-emerald-700 mt-0.5">Within 6h 15m</div>
              <div className="text-[10px] text-emerald-600">On-Time Expected</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase">EV Battery Status</div>
              <div className="font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                <span>84% Charged</span>
              </div>
              <div className="text-[10px] text-slate-500">Range: 210 km remaining</div>
            </div>
          </div>

          {/* Status Progress State */}
          <div className="p-3 bg-blue-50/60 rounded-md border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900">Current Trip Status</span>
              <span className="text-xs font-mono font-bold text-blue-700">
                {jobStatus === 'PICKUP_PENDING' && 'At Pickup Dock'}
                {jobStatus === 'IN_TRANSIT' && 'In Transit on NH44 (Salem → Dharmapuri)'}
                {jobStatus === 'DELIVERED' && 'Delivered & Handed Over'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
              <div className={`py-1.5 rounded ${jobStatus === 'PICKUP_PENDING' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                1. Pickup Loaded
              </div>
              <div className={`py-1.5 rounded ${jobStatus === 'IN_TRANSIT' ? 'bg-blue-600 text-white' : jobStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}`}>
                2. Highway Transit
              </div>
              <div className={`py-1.5 rounded ${jobStatus === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                3. Delivered
              </div>
            </div>
          </div>

          {/* Big Action Buttons */}
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
              <span>
                {jobStatus === 'PICKUP_PENDING' && 'Confirm Pickup & Begin Transit'}
                {jobStatus === 'IN_TRANSIT' && 'Mark Delivered at Destination'}
                {jobStatus === 'DELIVERED' && 'Mission Complete (Tap to cycle)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Mission History & Hours of Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">Hours of Service (HOS)</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900">4h 12m driven today</div>
          <p className="text-[11px] text-slate-500 mt-0.5">3h 48m duty remaining before mandatory rest break</p>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2.5">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '52%' }} />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">Completed This Week</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">6 Trips · 100% On-Time</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Rating: 4.95 ★ · Clean delivery bonus applied</p>
          <button
            onClick={() => navigate('/driver/history')}
            className="text-xs text-blue-700 font-semibold hover:underline mt-2 inline-block"
          >
            View Completed Waybills →
          </button>
        </div>
      </div>
    </div>
  );
}
