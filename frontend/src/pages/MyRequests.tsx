import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, PlusCircle, ArrowRight, Clock, MapPin,
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { transportApi } from '../api';
import type { TransportRequest } from '../types';
import toast from 'react-hot-toast';

const STATUS_BADGES: Record<string, string> = {
  PENDING: 'badge-slate',
  MATCHING: 'badge-amber',
  MATCHED: 'badge-blue',
  BOOKED: 'badge-green',
  CANCELLED: 'badge-red',
};

const PRIORITY_BADGES: Record<string, string> = {
  LOW: 'badge-slate',
  NORMAL: 'badge-blue',
  HIGH: 'badge-amber',
  URGENT: 'badge-red',
};

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await transportApi.listRequests();
      setRequests(data);
    } catch {
      toast.error('Failed to load transport requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Transport Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, re-evaluate, and manage all your freight procurement requirements.
          </p>
        </div>
        <button onClick={() => navigate('/create-request')} className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          <span>New Transport Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        {['ALL', 'MATCHED', 'BOOKED', 'PENDING'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-700 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status} ({status === 'ALL' ? requests.length : requests.filter((r) => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500">Loading freight requests...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-slate-800 font-medium">No transport requests found</h3>
          <p className="text-xs text-slate-500">
            Create a shipment request to evaluate carriers and view Smart Match recommendations.
          </p>
          <button onClick={() => navigate('/create-request')} className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            Create Request
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xs border-slate-200">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Corridor Route</th>
                  <th>Cargo Specification</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-semibold text-slate-700">
                      REQ-#{r.id}
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{r.pickup_location}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                        <span>{r.destination}</span>
                      </div>
                      {r.estimated_distance_km && (
                        <div className="text-[11px] text-slate-400">{r.estimated_distance_km} km highway corridor</div>
                      )}
                    </td>
                    <td>
                      <div className="text-slate-800 font-medium">{r.cargo_type}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.cargo_weight_kg} kg
                        {r.cargo_volume_m3 && ` • ${r.cargo_volume_m3} m³`}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${PRIORITY_BADGES[r.priority] || 'badge-slate'}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGES[r.status] || 'badge-slate'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="text-right space-x-2">
                      <Link
                        to={`/matching/${r.id}`}
                        className="btn-primary btn-sm inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Smart Match</span>
                      </Link>
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
