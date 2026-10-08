import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Car, Truck, PlusCircle, Filter, Search, CheckCircle2,
  AlertCircle, Fuel, BatteryCharging, Zap, X
} from 'lucide-react';
import { vehicleApi } from '../api';
import type { Vehicle } from '../types';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'badge-green',
  ASSIGNED: 'badge-blue',
  IN_TRANSIT: 'badge-amber',
  MAINTENANCE: 'badge-slate',
  OFFLINE: 'badge-red',
};

const FUEL_BADGE: Record<string, string> = {
  EV: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  DIESEL: 'bg-slate-100 text-slate-700 border-slate-300',
  PETROL: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function Fleet() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelFilter, setFuelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'register') {
      setShowAddModal(true);
    }
    if (location.pathname.includes('/availability')) {
      setStatusFilter('AVAILABLE');
    }
  }, [location.pathname, searchParams]);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '',
    vehicle_type: 'Tata Ace',
    fuel_type: 'DIESEL',
    capacity_kg: 750,
    vehicle_age_years: 1.5,
    efficiency: 1.2,
    current_location: 'Salem Hub',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleApi.list();
      setVehicles(data);
    } catch {
      toast.error('Failed to load fleet assets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleApi.create({
        ...newVehicle,
        capacity_kg: Number(newVehicle.capacity_kg),
        vehicle_age_years: Number(newVehicle.vehicle_age_years),
        efficiency: Number(newVehicle.efficiency),
      });
      toast.success(`Vehicle ${newVehicle.vehicle_number} registered!`);
      setShowAddModal(false);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add vehicle');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesFuel = fuelFilter === 'ALL' || v.fuel_type === fuelFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesFuel && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commercial Fleet Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage carrier fleet assets, vehicle payload specs, fuel classifications, and live dispatch readiness.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Vehicle
        </button>
      </div>

      {/* Fleet Stats Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Fleet Units</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{vehicles.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Commercial Vehicles</div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Available for Dispatch</div>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">
            {vehicles.filter((v) => v.status === 'AVAILABLE').length}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Immediate Allocation</div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">EV Green Cargo Fleet</div>
          <div className="text-xl font-bold text-blue-700 mt-0.5">
            {vehicles.filter((v) => v.fuel_type === 'EV').length}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">Zero Emission Vans</div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">In Transit Jobs</div>
          <div className="text-xl font-bold text-amber-600 mt-0.5">
            {vehicles.filter((v) => v.status === 'IN_TRANSIT' || v.status === 'ASSIGNED').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active Consignments</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Fuel Type:
          </span>
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="input-field py-1 text-xs w-32"
          >
            <option value="ALL">All Fuel Types</option>
            <option value="EV">EV Only</option>
            <option value="DIESEL">Diesel</option>
            <option value="PETROL">Petrol</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-1 text-xs w-36"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs text-slate-500">Loading fleet registry...</div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No vehicles match current criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Vehicle Number</th>
                  <th className="px-4 py-3">Model / Class</th>
                  <th className="px-4 py-3">Fuel Type</th>
                  <th className="px-4 py-3">Payload Capacity</th>
                  <th className="px-4 py-3">Operating Hub</th>
                  <th className="px-4 py-3">Efficiency</th>
                  <th className="px-4 py-3">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                      {v.vehicle_number}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {v.vehicle_type}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${FUEL_BADGE[v.fuel_type] || ''}`}>
                        {v.fuel_type === 'EV' && <Zap className="w-3 h-3 text-emerald-700" />}
                        {v.fuel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {v.capacity_kg} kg
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {v.current_location || 'Regional Depot'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {v.efficiency}x rating
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${STATUS_BADGE[v.status] || 'badge-slate'}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD VEHICLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register Fleet Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="label">Vehicle Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TN33AB9999"
                  value={newVehicle.vehicle_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                  className="input-field uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Vehicle Class</label>
                  <select
                    value={newVehicle.vehicle_type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="Tata Ace">Tata Ace</option>
                    <option value="Bolero Pickup">Bolero Pickup</option>
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="EV Cargo Van">EV Cargo Van</option>
                    <option value="Medium Truck">Medium Truck</option>
                    <option value="Heavy Truck">Heavy Truck</option>
                  </select>
                </div>
                <div>
                  <label className="label">Powertrain / Fuel</label>
                  <select
                    value={newVehicle.fuel_type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="EV">EV (Electric)</option>
                    <option value="PETROL">Petrol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    value={newVehicle.capacity_kg}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity_kg: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Current Operating Hub</label>
                  <input
                    type="text"
                    value={newVehicle.current_location}
                    onChange={(e) => setNewVehicle({ ...newVehicle, current_location: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
