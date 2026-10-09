import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Car, Truck, PlusCircle, Filter, Search, CheckCircle2,
  AlertCircle, Fuel, BatteryCharging, Zap, X, ShieldCheck,
  User, Phone, Calendar, ArrowRight, Activity, Wrench, FileText
} from 'lucide-react';
import { vehicleApi, driverApi } from '../api';
import type { Vehicle, Driver } from '../types';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = location.pathname.includes('driver') || searchParams.get('tab') === 'drivers' ? 'drivers' : 'vehicles';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    in_transit: 0,
    maintenance: 0,
    offline: 0
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');
  const [fuelFilter, setFuelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [assigningVehicle, setAssigningVehicle] = useState<Vehicle | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    registration_number: '',
    vehicle_number: '',
    vehicle_type: 'Tata Ace',
    make: 'Tata Motors',
    model: 'Ace Gold',
    manufacture_year: 2023,
    fuel_type: 'DIESEL',
    capacity_kg: 750,
    volume_m3: 4.0,
    length_ft: 7.0,
    width_ft: 5.0,
    height_ft: 5.0,
    current_location: 'Salem',
    home_location: 'Salem',
    fuel_efficiency: 16.0,
    mileage: 24000,
  });

  useEffect(() => {
    if (searchParams.get('action') === 'register') {
      setShowAddModal(true);
    }
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vData, dData, summaryRes] = await Promise.all([
        vehicleApi.list(statusFilter === 'ALL' ? {} : { status: statusFilter }),
        driverApi.list(),
        fetch('http://localhost:8000/api/vehicles/summary', {
          headers: { Authorization: `Bearer ${localStorage.getItem('driva_token') || 'test-token'}` }
        }).then(res => res.json())
      ]);
      setVehicles(vData);
      setDrivers(dData);
      setSummary(summaryRes);
    } catch {
      toast.error('Failed to load fleet assets and driver registry');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    try {
      const updated = await vehicleApi.toggleAvailability(vehicle.id);
      toast.success(
        `Vehicle ${vehicle.registration_number || vehicle.vehicle_number} status updated to ${updated.status}`
      );
      setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? { ...v, status: updated.status, availability: updated.availability } : v)));
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle({ ...selectedVehicle, status: updated.status, availability: updated.availability });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to toggle availability');
    }
  };

  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningVehicle || selectedDriverId === '') return;
    try {
      const updated = await vehicleApi.assignDriver(assigningVehicle.id, Number(selectedDriverId));
      toast.success(`Assigned driver to ${assigningVehicle.registration_number || assigningVehicle.vehicle_number}!`);
      setAssigningVehicle(null);
      setSelectedDriverId('');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to assign driver');
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleApi.create({
        ...newVehicle,
        vehicle_number: newVehicle.registration_number,
        capacity_kg: Number(newVehicle.capacity_kg),
        volume_m3: Number(newVehicle.volume_m3),
        length_ft: Number(newVehicle.length_ft),
        width_ft: Number(newVehicle.width_ft),
        height_ft: Number(newVehicle.height_ft),
        manufacture_year: Number(newVehicle.manufacture_year),
        fuel_efficiency: Number(newVehicle.fuel_efficiency),
        mileage: Number(newVehicle.mileage),
      });
      toast.success(`Vehicle ${newVehicle.registration_number} registered!`);
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add vehicle');
    }
  };

  // Filtered Vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const reg = (v.registration_number || v.vehicle_number || '').toLowerCase();
    const type = (v.vehicle_type || '').toLowerCase();
    const driver = (v.driver_name || '').toLowerCase();
    const loc = (v.current_location || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || reg.includes(q) || type.includes(q) || driver.includes(q) || loc.includes(q);
    const matchesFuel = fuelFilter === 'ALL' || v.fuel_type === fuelFilter;
    const matchesType = vehicleTypeFilter === 'ALL' || v.vehicle_type === vehicleTypeFilter;
    const matchesLoc = locationFilter === 'ALL' || (v.current_location && v.current_location.toLowerCase().includes(locationFilter.toLowerCase()));

    return matchesSearch && matchesFuel && matchesType && matchesLoc;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Commercial Fleet Operations
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">PostgreSQL Source of Truth</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle & Pilot Operations Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit commercial vehicle assets, physical dimensions, driver assignments, and live corridor dispatch readiness.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSearchParams({ tab: activeTab === 'drivers' ? 'vehicles' : 'drivers' });
            }}
            className="btn-secondary text-xs"
          >
            {activeTab === 'drivers' ? 'View Vehicle Registry' : `View Certified Drivers (${drivers.length})`}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Commercial Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Stats Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Fleet Units</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.total}</div>
        </div>

        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Available for Dispatch</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">
            {summary.available}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {summary.total > 0 ? `${Math.round((summary.available / summary.total) * 100)}% Instant Ready` : '0% Ready'}
          </div>
        </div>

        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Assigned / In Transit</div>
          <div className="text-2xl font-bold text-blue-700 mt-0.5">
            {summary.assigned + summary.in_transit}
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Active consignment routes</div>
        </div>

        <div className="card p-3">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Certified Pilots</div>
          <div className="text-2xl font-bold text-indigo-700 mt-0.5">
            {drivers.length}
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
            {drivers.filter((d) => d.is_available).length} pilots available on duty
          </div>
        </div>
      </div>

      {/* VIEW TAB: VEHICLES */}
      {activeTab !== 'drivers' && (
        <div className="space-y-4">
          {/* Search & Multi-Filter Bar */}
          <div className="card p-3.5 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by registration (e.g. TN 34 AB 1234), model, driver, or hub..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-9 text-xs w-full"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="input-field py-1 text-xs"
                >
                  <option value="ALL">All Vehicle Classes</option>
                  <option value="Mini Truck">Mini Truck</option>
                  <option value="Pickup Truck">Pickup Truck</option>
                  <option value="Light Commercial Vehicle">Light Commercial (LCV)</option>
                  <option value="Electric Cargo Van">Electric Cargo Van</option>
                  <option value="Medium Truck">Medium Truck</option>
                  <option value="Heavy Truck">Heavy Truck</option>
                </select>

                <select
                  value={fuelFilter}
                  onChange={(e) => setFuelFilter(e.target.value)}
                  className="input-field py-1 text-xs"
                >
                  <option value="ALL">All Fuels</option>
                  <option value="EV">Electric (EV)</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setSearchParams({ ...Object.fromEntries(searchParams.entries()), status: e.target.value });
                    setTimeout(() => fetchData(), 50);
                  }}
                  className="input-field py-1 text-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="MAINTENANCE">GARAGE / MAINTENANCE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="input-field py-1 text-xs"
                >
                  <option value="ALL">All Hubs</option>
                  <option value="Salem">Salem</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Bangalore">Bangalore</option>
                </select>

                {(searchTerm || vehicleTypeFilter !== 'ALL' || fuelFilter !== 'ALL' || statusFilter !== 'ALL' || locationFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setVehicleTypeFilter('ALL');
                      setFuelFilter('ALL');
                      setStatusFilter('ALL');
                      setLocationFilter('ALL');
                    }}
                    className="text-xs text-rose-600 font-semibold hover:underline px-2"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <div className="text-xs text-slate-500">Loading verified fleet assets from PostgreSQL...</div>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No vehicles match current criteria. Adjust search or filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Registration</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Fuel</th>
                      <th className="px-4 py-3">Capacity</th>
                      <th className="px-4 py-3">Volume</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div>{v.model || v.vehicle_type}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{v.make || 'Tata Motors'} ({v.manufacture_year || 2022})</div>
                        </td>

                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          {v.registration_number || v.vehicle_number}
                        </td>

                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {v.vehicle_type}
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${FUEL_BADGE[v.fuel_type] || ''}`}>
                            {v.fuel_type === 'EV' && <Zap className="w-3 h-3 text-emerald-700" />}
                            {v.fuel_type}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          {v.capacity_kg} kg
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-600">
                          {v.volume_m3 ? `${v.volume_m3} m³` : '4.0 m³'}
                        </td>

                        <td className="px-4 py-3">
                          {v.driver_name ? (
                            <div>
                              <div className="font-semibold text-slate-900">{v.driver_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{v.driver_phone || 'Assigned'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {v.current_location || 'Salem'}
                        </td>

                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_BADGE[v.status] || 'badge-slate'}`}>
                            {v.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-semibold text-amber-600">
                          {v.rating ? `${v.rating} ★` : '4.8 ★'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedVehicle(v)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                              title="View Full Specifications"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => handleToggleAvailability(v)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                                v.status === 'AVAILABLE'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title="Toggle Availability"
                            >
                              {v.status === 'AVAILABLE' ? 'Set Offline' : 'Set Ready'}
                            </button>

                            <button
                              onClick={() => {
                                setAssigningVehicle(v);
                                setSelectedDriverId(v.driver_id || '');
                              }}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] transition-colors"
                              title="Assign Certified Driver"
                            >
                              Driver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW TAB: DRIVERS (Section 25) */}
      {activeTab === 'drivers' && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Commercial Pilot Directory</h3>
              <p className="text-[11px] text-slate-500">Certified commercial drivers, licensing verification, and active duties</p>
            </div>
            <button
              onClick={() => setSearchParams({ tab: 'vehicles' })}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              ← Back to Vehicle Fleet
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Phone & Contact</th>
                  <th className="px-4 py-3">License Number</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Completed Trips</th>
                  <th className="px-4 py-3">Success Rate</th>
                  <th className="px-4 py-3">Assigned Vehicle</th>
                  <th className="px-4 py-3">Current Location</th>
                  <th className="px-4 py-3">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {d.name}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {d.phone}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-blue-900">
                      {d.license_number}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {d.experience_years} Years
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-amber-600">
                      {d.rating} ★
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                      {d.total_deliveries} Trips
                    </td>

                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      {d.total_deliveries > 0
                        ? `${Math.round(((d.successful_deliveries || d.total_deliveries) / d.total_deliveries) * 100)}%`
                        : '100%'}
                    </td>

                    <td className="px-4 py-3.5">
                      {d.assigned_vehicle_reg ? (
                        <span className="font-mono font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {d.assigned_vehicle_reg}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {d.current_location || 'Salem'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`badge ${d.is_available ? 'badge-green' : 'badge-amber'}`}>
                        {d.is_available ? 'Available' : 'On Duty'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          VEHICLE DETAILS MODAL (Section 24)
      ─────────────────────────────────────────────────────────── */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedVehicle.vehicle_type}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedVehicle.registration_number || selectedVehicle.vehicle_number}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.manufacture_year}) · Provider: {selectedVehicle.provider_name || 'Fleet Partner'}
                </p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Payload Capacity</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{selectedVehicle.capacity_kg} kg</div>
                <div className="text-[10px] text-slate-500 font-mono">Vol: {selectedVehicle.volume_m3 || 4.0} m³</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Cargo Bay Envelope</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedVehicle.length_ft || 7.0}ft × {selectedVehicle.width_ft || 5.0}ft × {selectedVehicle.height_ft || 5.0}ft
                </div>
                <div className="text-[10px] text-slate-500">
                  ~{(Number(selectedVehicle.length_ft || 7.0) * 0.3048).toFixed(1)}m × {(Number(selectedVehicle.width_ft || 5.0) * 0.3048).toFixed(1)}m × {(Number(selectedVehicle.height_ft || 5.0) * 0.3048).toFixed(1)}m
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Fuel & Efficiency</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <span>{selectedVehicle.fuel_type}</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  {selectedVehicle.fuel_efficiency || 14.0} km/L · {selectedVehicle.mileage || 45000} km
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Dispatch Status</div>
                <div className="mt-0.5">
                  <span className={`badge ${STATUS_BADGE[selectedVehicle.status] || 'badge-slate'}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{selectedVehicle.current_location || 'Salem'}</div>
              </div>
            </div>

            {/* Driver & Operating Assignment */}
            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 text-xs">
              <div className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-700" />
                <span>Assigned Pilot Credentials</span>
              </div>
              {selectedVehicle.driver_name ? (
                <div className="grid sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500">Pilot Name:</span>{' '}
                    <span className="font-bold text-slate-900">{selectedVehicle.driver_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact:</span>{' '}
                    <span className="font-mono text-slate-800">{selectedVehicle.driver_phone || 'Verified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Duty Location:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedVehicle.current_location}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  No pilot currently linked to this chassis. Use the "Driver" action button to link a driver.
                </div>
              )}
            </div>

            {/* Delivery Statistics & Analytics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Total Deliveries</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{selectedVehicle.total_deliveries || 14}</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Successful Deliveries</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">{selectedVehicle.successful_deliveries || selectedVehicle.total_deliveries || 14}</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Success Rate</div>
                <div className="text-lg font-black text-blue-700 mt-0.5">
                  {selectedVehicle.total_deliveries ? `${Math.round(((selectedVehicle.successful_deliveries || selectedVehicle.total_deliveries) / selectedVehicle.total_deliveries) * 100)}%` : '100%'}
                </div>
              </div>
              <div className="p-2.5 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Average Rating</div>
                <div className="text-lg font-black text-amber-600 mt-0.5">{selectedVehicle.rating || 4.8} ★</div>
              </div>
            </div>

            {/* Compliance & Maintenance Dates */}
            <div className="grid sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Insurance Certificate</div>
                <div className="font-mono font-bold text-emerald-800 mt-0.5">
                  Valid till {selectedVehicle.insurance_expiry || '2027-05-15'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fitness Certificate</div>
                <div className="font-mono font-bold text-emerald-800 mt-0.5">
                  Valid till {selectedVehicle.fitness_expiry || '2027-04-10'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Last Scheduled Service</div>
                <div className="font-mono text-slate-700 mt-0.5">
                  {selectedVehicle.last_service_date || '2024-09-01'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <button
                onClick={() => handleToggleAvailability(selectedVehicle)}
                className="btn-secondary text-xs"
              >
                {selectedVehicle.status === 'AVAILABLE' ? 'Toggle Offline' : 'Mark Available'}
              </button>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="btn-primary text-xs"
              >
                Close Specification Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          DRIVER ASSIGNMENT MODAL
      ─────────────────────────────────────────────────────────── */}
      {assigningVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Assign Certified Pilot</h3>
              <button onClick={() => setAssigningVehicle(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select an available commercial pilot for chassis{' '}
              <strong className="font-mono text-slate-900">
                {assigningVehicle.registration_number || assigningVehicle.vehicle_number}
              </strong>{' '}
              ({assigningVehicle.vehicle_type}).
            </p>

            <form onSubmit={handleAssignDriver} className="space-y-4 text-xs">
              <div>
                <label className="label">Certified Driver Selection</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="input-field w-full py-2"
                >
                  <option value="">-- Choose Commercial Pilot --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.license_number} ({d.experience_years} yrs exp, {d.rating}★) {d.is_available ? '• Available' : '• Busy'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningVehicle(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          REGISTER VEHICLE MODAL
      ─────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register Commercial Fleet Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="TN 34 AB 1234"
                    value={newVehicle.registration_number}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value })}
                    className="input-field w-full uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="label">Vehicle Class</label>
                  <select
                    value={newVehicle.vehicle_type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="Tata Ace">Tata Ace (Mini Truck)</option>
                    <option value="Mahindra Bolero Pickup">Mahindra Bolero (Pickup)</option>
                    <option value="Tata Intra V30">Tata Intra V30 (Pickup)</option>
                    <option value="Ashok Leyland Dost">Ashok Leyland Dost (LCV)</option>
                    <option value="Tata 407">Tata 407 (LCV)</option>
                    <option value="EV Cargo Van">EV Cargo Van (Electric)</option>
                    <option value="Tata 709">Tata 709 (Medium Truck)</option>
                    <option value="Eicher Pro 2049">Eicher Pro 2049 (Medium Truck)</option>
                    <option value="BharatBenz 1217">BharatBenz 1217 (Heavy Truck)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fuel Type</label>
                  <select
                    value={newVehicle.fuel_type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="EV">Electric (EV)</option>
                    <option value="PETROL">Petrol</option>
                  </select>
                </div>

                <div>
                  <label className="label">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    value={newVehicle.capacity_kg}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity_kg: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="label">Volume (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newVehicle.volume_m3}
                    onChange={(e) => setNewVehicle({ ...newVehicle, volume_m3: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label">Length (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newVehicle.length_ft}
                    onChange={(e) => setNewVehicle({ ...newVehicle, length_ft: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label">Width (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newVehicle.width_ft}
                    onChange={(e) => setNewVehicle({ ...newVehicle, width_ft: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label">Height (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newVehicle.height_ft}
                    onChange={(e) => setNewVehicle({ ...newVehicle, height_ft: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Current Operating Hub</label>
                  <input
                    type="text"
                    value={newVehicle.current_location}
                    onChange={(e) => setNewVehicle({ ...newVehicle, current_location: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="label">Fuel Efficiency (km/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVehicle.fuel_efficiency}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuel_efficiency: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
