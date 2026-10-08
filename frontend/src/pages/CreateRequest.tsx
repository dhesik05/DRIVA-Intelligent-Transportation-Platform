import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Package, Truck, Clock, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { transportApi, matchingApi } from '../api';
import toast from 'react-hot-toast';

const CORRIDORS = [
  { origin: 'Salem', destination: 'Bangalore', distance: '340 km', popular: true },
  { origin: 'Chennai', destination: 'Coimbatore', distance: '500 km', popular: false },
  { origin: 'Salem', destination: 'Chennai', distance: '340 km', popular: false },
  { origin: 'Bangalore', destination: 'Chennai', distance: '350 km', popular: false },
  { origin: 'Coimbatore', destination: 'Bangalore', distance: '360 km', popular: false },
];

const CARGO_TYPES = [
  'Electronics',
  'Textiles',
  'FMCG',
  'Automotive Parts',
  'Pharmaceuticals',
  'Perishables',
  'Heavy Machinery',
  'Raw Materials',
  'Furniture',
];

const VEHICLE_OPTIONS = [
  { id: 'Any', label: 'Any Compatible Vehicle', desc: 'Let DRIVA select the optimal vehicle match' },
  { id: 'Tata Ace', label: 'Tata Ace', desc: 'Capacity: 750 kg • Best for light intra-city & express' },
  { id: 'Bolero Pickup', label: 'Bolero Pickup', desc: 'Capacity: 1,000 kg • Rugged regional delivery' },
  { id: 'EV Cargo Van', label: 'EV Cargo Van', desc: 'Capacity: 800 kg • Zero emission, low operating cost' },
  { id: 'Mini Truck', label: 'Mini Truck', desc: 'Capacity: 2,500 kg • Medium commercial cargo' },
  { id: 'Medium Truck', label: 'Medium Truck', desc: 'Capacity: 5,000 kg • Bulk regional freight' },
  { id: 'Heavy Truck', label: 'Heavy Truck', desc: 'Capacity: 15,000 kg • Heavy industrial loads' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState(1);

  // Form state initialized with mandatory demo values (Salem -> Bangalore, 200kg Electronics, Today)
  const [formData, setFormData] = useState({
    pickup_location: 'Salem',
    destination: 'Bangalore',
    cargo_type: 'Electronics',
    cargo_weight: 200,
    cargo_volume: 0.8,
    cargo_dimensions: '1.2m x 0.8m x 0.8m',
    vehicle_type: 'Any',
    deadline: 'Today (Within 8 hours)',
    deadline_hours: 8,
    priority: 'HIGH',
    special_requirements: 'Fragile electronics — weather-protected and shock-isolated handling',
  });

  const handleCorridorSelect = (origin: string, dest: string) => {
    setFormData((prev) => ({ ...prev, pickup_location: origin, destination: dest }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmittingStep(1);

    const t1 = setTimeout(() => setSubmittingStep(2), 200);
    const t2 = setTimeout(() => setSubmittingStep(3), 400);
    const t3 = setTimeout(() => setSubmittingStep(4), 600);

    try {
      // Calculate realistic ISO deadline from selection
      let hours = 8;
      if (formData.deadline.includes('12')) hours = 12;
      else if (formData.deadline.includes('24')) hours = 24;
      else if (formData.deadline.includes('48')) hours = 48;
      const isoDeadline = new Date(Date.now() + hours * 3600 * 1000).toISOString();

      let length_m = 0;
      let width_m = 0;
      let height_m = 0;
      if (formData.cargo_dimensions) {
        const dims = formData.cargo_dimensions.toLowerCase().replace(/m/g, '').split('x').map(s => Number(s.trim()));
        if (dims.length === 3 && !dims.some(isNaN)) {
          [length_m, width_m, height_m] = dims;
        }
      }

      const payload = {
        pickup_location: formData.pickup_location,
        destination: formData.destination,
        cargo_type: formData.cargo_type,
        cargo_weight_kg: Number(formData.cargo_weight),
        cargo_volume_m3: Number(formData.cargo_volume),
        cargo_length_m: length_m || undefined,
        cargo_width_m: width_m || undefined,
        cargo_height_m: height_m || undefined,
        cargo_dimensions: formData.cargo_dimensions,
        vehicle_type_preference: formData.vehicle_type === 'Any' ? 'Tata Ace' : formData.vehicle_type,
        deadline: isoDeadline,
        priority: formData.priority,
        special_requirements: formData.special_requirements,
      };

      console.log('Registering transport request:', payload);
      const res = await transportApi.createRequest(payload);
      
      setSubmittingStep(4);
      console.log('Evaluating Smart Match predictions for request:', res.id);
      const matchResult = await matchingApi.runMatch(res.id);
      
      setSubmittingStep(5);
      toast.success('Transportation options evaluated successfully!');
      
      // Navigate to matching results with the preloaded data available immediately
      navigate(`/matching/${res.id}`, { state: { matchData: matchResult } });
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      const detail = err?.response?.data?.detail;
      const message = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
        : 'Failed to create and evaluate transport request';
      toast.error(message);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
          <span>Transportation Procurement</span>
          <span>•</span>
          <span>Step {step} of 4</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create Transport Request</h1>
        <p className="text-sm text-slate-500">
          Specify your cargo requirement. DRIVA will evaluate available vehicles, predict costs/ETA, and recommend the optimal provider.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-4">
        {[
          { num: 1, label: 'Route & Corridor' },
          { num: 2, label: 'Cargo Specs' },
          { num: 3, label: 'Vehicle & Priority' },
          { num: 4, label: 'Review & Match' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md transition-colors ${
              step === s.num
                ? 'bg-blue-50 border border-blue-200 text-blue-900 font-medium'
                : step > s.num
                ? 'text-emerald-700'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? 'bg-blue-700 text-white'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="text-xs truncate">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card p-6">
        {/* STEP 1: ROUTE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Origin & Destination</h2>
              <p className="text-xs text-slate-500">Select freight corridor or enter customized pickup and drop-off hubs.</p>
            </div>

            {/* Quick Corridors */}
            <div>
              <div className="text-xs font-medium text-slate-700 mb-2">High-Frequency Freight Corridors (Demo Presets):</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {CORRIDORS.map((c) => {
                  const selected = formData.pickup_location === c.origin && formData.destination === c.destination;
                  return (
                    <button
                      key={`${c.origin}-${c.destination}`}
                      type="button"
                      onClick={() => handleCorridorSelect(c.origin, c.destination)}
                      className={`text-left p-3 rounded-lg border text-xs transition-all ${
                        selected
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{c.origin} → {c.destination}</span>
                        {c.popular && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold">
                            Demo Target
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Approx. {c.distance}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="label">Pickup Location (City / Industrial Hub)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    className="input-field pl-9"
                    placeholder="e.g. Salem Industrial Estate"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Destination (City / Warehouse Hub)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="input-field pl-9"
                    placeholder="e.g. Bangalore Electronic City"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.pickup_location || !formData.destination}
                className="btn-primary"
              >
                Continue to Cargo Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CARGO SPECS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Cargo Specifications</h2>
              <p className="text-xs text-slate-500">Accurate dimensions and weight ensure capacity constraints are strictly evaluated.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Cargo Category</label>
                <select
                  value={formData.cargo_type}
                  onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                  className="input-field"
                >
                  {CARGO_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Net Cargo Weight (kg)</label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={formData.cargo_weight}
                    onChange={(e) => setFormData({ ...formData, cargo_weight: Number(e.target.value) })}
                    className="input-field pl-9"
                    placeholder="200"
                    min="1"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Vehicles with capacity below this will be rejected.</p>
              </div>

              <div>
                <label className="label">Estimated Volume (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cargo_volume}
                  onChange={(e) => setFormData({ ...formData, cargo_volume: Number(e.target.value) })}
                  className="input-field"
                  placeholder="0.8"
                />
              </div>

              <div>
                <label className="label">Cargo Dimensions (L × W × H)</label>
                <input
                  type="text"
                  value={formData.cargo_dimensions}
                  onChange={(e) => setFormData({ ...formData, cargo_dimensions: e.target.value })}
                  className="input-field"
                  placeholder="1.2m x 0.8m x 0.8m"
                />
              </div>
            </div>

            <div>
              <label className="label">Special Handling or Packaging Instructions</label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                rows={2}
                className="input-field"
                placeholder="Fragile, temperature sensitive, waterproof tarp required..."
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Back to Route
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.cargo_weight || formData.cargo_weight <= 0}
                className="btn-primary"
              >
                Continue to Vehicle & Priority
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VEHICLE & PRIORITY */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Vehicle Preference & Delivery Priority</h2>
              <p className="text-xs text-slate-500">Configure vehicle preferences and schedule deadlines.</p>
            </div>

            <div>
              <label className="label mb-2">Preferred Vehicle Class</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {VEHICLE_OPTIONS.map((v) => {
                  const selected = formData.vehicle_type === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, vehicle_type: v.id })}
                      className={`text-left p-3 rounded-lg border text-xs transition-all ${
                        selected
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-700" />
                        <span>{v.label}</span>
                      </div>
                      <div className="text-slate-500 mt-1">{v.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="label">Delivery Deadline</label>
                <select
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                >
                  <option value="Today (Within 8 hours)">Today (Within 8 hours) - Demo Target</option>
                  <option value="Within 12 hours">Within 12 hours</option>
                  <option value="Within 24 hours">Within 24 hours (Next Day)</option>
                  <option value="Within 48 hours">Within 48 hours (Standard)</option>
                </select>
              </div>

              <div>
                <label className="label">Priority Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 rounded-md text-xs font-semibold border transition-all ${
                        formData.priority === p
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                Back to Cargo
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary">
                Review Requirement
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & FIND BEST TRANSPORT */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Requirement Verification</h2>
              <p className="text-xs text-slate-500">Review your parameters before executing the DRIVA multi-factor matching engine.</p>
            </div>

            {/* Structured Review Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Corridor Route</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {formData.pickup_location} → {formData.destination}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Cargo Category</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formData.cargo_type}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Cargo Net Weight</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formData.cargo_weight} kg</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Volume & Dims</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formData.cargo_volume} m³</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-200">
                <div>
                  <div className="text-slate-400 font-medium">Vehicle Preference</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formData.vehicle_type}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Required Deadline</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formData.deadline}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Dispatch Priority</div>
                  <div className="mt-0.5">
                    <span className="badge badge-amber font-bold">{formData.priority}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Special Requirements</div>
                  <div className="font-medium text-slate-700 truncate mt-0.5">{formData.special_requirements || 'None'}</div>
                </div>
              </div>
            </div>

            {/* Enterprise Assurance Banner */}
            <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-200 rounded-lg p-4 text-xs text-blue-900">
              <Sparkles className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Automated Intelligence Evaluation:</span> Upon clicking, DRIVA will filter out vehicles with insufficient payload capacity, query trained ML models for cost and ETA predictions, evaluate provider reliability and availability, and rank top options with 7-factor scoring.
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary" disabled={submitting}>
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Evaluating Transport Network...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Find Best Transport
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Checklist Overlay Modal */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-6 shadow-xl border-slate-200">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-700 mx-auto flex items-center justify-center mb-2">
                <Truck className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Finding the best transportation...</h2>
              <p className="text-xs text-slate-500">
                Evaluating candidate carriers and optimizing multi-criteria match score
              </p>
            </div>

            <div className="space-y-3">
              {[
                { num: 1, label: 'Validating cargo requirements' },
                { num: 2, label: 'Checking available vehicles' },
                { num: 3, label: 'Checking cargo dimensions' },
                { num: 4, label: 'Predicting cost and ETA' },
                { num: 5, label: 'Ranking transportation options' },
              ].map((s) => {
                const isDone = submittingStep > s.num;
                const isCurrent = submittingStep === s.num;
                return (
                  <div key={s.num} className="flex items-center gap-3 text-xs">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 animate-spin">
                        <div className="w-2 h-2 rounded-full bg-blue-700" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                    )}
                    <span className={isDone ? 'text-slate-800 font-medium' : isCurrent ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-700 h-full transition-all duration-300"
                style={{ width: `${(submittingStep / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
