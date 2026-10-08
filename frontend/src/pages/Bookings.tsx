import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Package, MapPin, Truck, ChevronRight, Search, Filter,
  CheckCircle2, Clock, Eye, Star, AlertCircle
} from 'lucide-react';
import { bookingApi } from '../api';
import type { BookingWithDetails } from '../types';
import toast from 'react-hot-toast';

const STATUS_BADGES: Record<string, string> = {
  CONFIRMED: 'badge-blue',
  DRIVER_ASSIGNED: 'badge-blue',
  VEHICLE_ARRIVED: 'badge-amber',
  PICKUP_COMPLETED: 'badge-amber',
  IN_TRANSIT: 'badge-amber',
  NEAR_DESTINATION: 'badge-amber',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
};

export default function Bookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (location.pathname.includes('/history')) {
      setStatusFilter('DELIVERED');
    }
    fetchBookings();
  }, [location.pathname]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.listBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toString().includes(searchQuery) ||
      (b.provider?.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.request?.pickup_location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.request?.destination || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transportation Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized registry of all commercial carriage orders, assigned vehicles, and delivery statuses.
          </p>
        </div>
        <button
          onClick={() => navigate('/create-request')}
          className="btn-primary text-xs"
        >
          New Transport Request
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Booking ID, Carrier, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 text-xs flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-1.5 text-xs w-full sm:w-40"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs text-slate-500">Loading orders...</div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">No Bookings Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no matching transportation bookings. Create a request to match and book verified fleet carriers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Route Corridor</th>
                  <th className="px-4 py-3">Cargo Spec</th>
                  <th className="px-4 py-3">Carrier / Vehicle</th>
                  <th className="px-4 py-3">Quoted Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      #{b.id}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      <div>
                        {b.request?.pickup_location} → {b.request?.destination}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ETA: {b.estimated_eta_hours ? `${b.estimated_eta_hours.toFixed(1)} hrs` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <div>{b.request?.cargo_type || 'Commercial Goods'}</div>
                      <div className="text-[10px] text-slate-400">
                        {b.request?.cargo_weight_kg ? `${b.request.cargo_weight_kg} kg` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="font-semibold text-slate-900">{b.provider?.company_name || 'Carrier Partner'}</div>
                      <div className="text-[10px] text-slate-500">
                        {b.vehicle?.vehicle_number || 'TN33AB1001'} • {b.vehicle?.vehicle_type || 'Truck'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ₹{Math.round(b.quoted_price).toLocaleString()}
                      <div className="text-[10px] text-slate-400 font-normal">
                        Service Fee: ₹{Math.round(b.driva_commission || b.quoted_price * 0.05)} (5%)
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${STATUS_BADGES[b.status] || 'badge-slate'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/tracking/${b.id}`)}
                        className="btn-primary btn-sm inline-flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        Track Consignment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
