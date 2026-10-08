import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, CheckCircle2, Truck, Clock, ShieldCheck,
  Star, ChevronRight, AlertCircle, ArrowLeft, Send
} from 'lucide-react';
import { bookingApi, ratingApi } from '../api';
import type { BookingWithDetails } from '../types';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// City coordinates mapping for demo corridors
const CITY_COORDS: Record<string, [number, number]> = {
  Salem: [11.6643, 78.1460],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Trichy: [10.7905, 78.7047],
};

const TIMELINE_STAGES = [
  { key: 'CONFIRMED', label: 'Booking Confirmed', desc: 'Carriage contract authorized' },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', desc: 'Commercial pilot allocated' },
  { key: 'VEHICLE_ARRIVED', label: 'Vehicle Arrived', desc: 'At origin pickup point' },
  { key: 'PICKUP_COMPLETED', label: 'Pickup Completed', desc: 'Cargo loaded & sealed' },
  { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Moving along corridor' },
  { key: 'NEAR_DESTINATION', label: 'Near Destination', desc: 'Within delivery perimeter' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Consignment handed over' },
];

// Custom HTML Pin Icons for Leaflet
const createPinIcon = (color: string, label: string) =>
  L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<div style="
      background-color: ${color};
      color: white;
      font-weight: bold;
      font-size: 10px;
      padding: 3px 7px;
      border-radius: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    ">📍 ${label}</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });

const vehicleIcon = L.divIcon({
  className: 'custom-vehicle-pin',
  html: `<div style="
    background-color: #1d4ed8;
    color: white;
    font-size: 14px;
    padding: 6px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(29, 78, 216, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  ">🚛</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Tracking() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [timelinessVal, setTimelinessVal] = useState(5);
  const [serviceVal, setServiceVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('Excellent transit reliability and professional handling.');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      if (bookingId) {
        const data = await bookingApi.getBooking(Number(bookingId));
        setBooking(data);
      } else {
        // if no ID provided in URL, grab latest
        const all = await bookingApi.listBookings();
        if (all.length > 0) {
          const latest = await bookingApi.getBooking(all[0].id);
          setBooking(latest);
        }
      }
    } catch {
      toast.error('Failed to load tracking details');
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = TIMELINE_STAGES.findIndex(
    (s) => s.key === (booking?.status || 'CONFIRMED')
  );

  const advanceStage = async () => {
    if (!booking) return;
    const nextIdx = currentStageIndex + 1;
    if (nextIdx >= TIMELINE_STAGES.length) return;

    setUpdatingStatus(true);
    try {
      const nextStage = TIMELINE_STAGES[nextIdx].key;
      await bookingApi.updateStatus(booking.id, nextStage, 'Salem-Bangalore Highway NH44');
      toast.success(`Delivery advanced to: ${TIMELINE_STAGES[nextIdx].label}`);
      await fetchBooking();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update stage');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!booking) return;
    try {
      await ratingApi.submit({
        booking_id: booking.id,
        overall_rating: ratingVal,
        timeliness_rating: timelinessVal,
        service_rating: serviceVal,
        comment: ratingComment,
      });
      toast.success('Carrier rating recorded! Thank you for your feedback.');
      setRatingSubmitted(true);
      setShowRatingModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to record rating');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Active Delivery Selected</h2>
        <p className="text-xs text-slate-500">Select an existing booking from your orders or create a new request.</p>
        <button onClick={() => navigate('/bookings')} className="btn-primary mx-auto">
          View All Bookings
        </button>
      </div>
    );
  }

  const originCity = booking.request?.pickup_location?.split(' ')[0] || 'Salem';
  const destCity = booking.request?.destination?.split(' ')[0] || 'Bangalore';

  const originPoint: [number, number] = CITY_COORDS[originCity] || [11.6643, 78.1460];
  const destPoint: [number, number] = CITY_COORDS[destCity] || [12.9716, 77.5946];

  // Calculate simulated vehicle position based on transit progression percentage
  const progressRatio = Math.max(0, Math.min(1, currentStageIndex / (TIMELINE_STAGES.length - 1)));
  const vehiclePos: [number, number] = [
    originPoint[0] + (destPoint[0] - originPoint[0]) * progressRatio,
    originPoint[1] + (destPoint[1] - originPoint[1]) * progressRatio,
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/bookings')}
            className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bookings
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Consignment Tracking</h1>
            <span className="badge badge-blue font-bold">Booking #{booking.id}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Corridor: <strong className="text-slate-700">{originCity} → {destCity}</strong> • Cargo: <strong className="text-slate-700">{booking.request?.cargo_type} ({booking.request?.cargo_weight_kg} kg)</strong>
          </p>
        </div>

        {/* Advance Stage button for Demo */}
        <div className="flex items-center gap-3">
          {booking.status === 'DELIVERED' ? (
            <button
              onClick={() => setShowRatingModal(true)}
              className="btn-primary bg-emerald-700 hover:bg-emerald-800 text-xs"
            >
              <Star className="w-3.5 h-3.5" />
              {ratingSubmitted ? 'Rating Submitted ✓' : 'Rate Carrier Delivery'}
            </button>
          ) : (
            <button
              onClick={advanceStage}
              disabled={updatingStatus}
              className="btn-primary text-xs"
            >
              {updatingStatus ? (
                'Advancing Status...'
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5" />
                  Advance Delivery Stage (Demo)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: INTERACTIVE LEAFLET MAP */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden h-[420px] relative border border-slate-200">
            <MapContainer
              center={[(originPoint[0] + destPoint[0]) / 2, (originPoint[1] + destPoint[1]) / 2]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Origin Marker */}
              <Marker position={originPoint} icon={createPinIcon('#0f172a', originCity)}>
                <Popup>Origin: {originCity} Hub</Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={destPoint} icon={createPinIcon('#10b981', destCity)}>
                <Popup>Destination: {destCity} Hub</Popup>
              </Marker>

              {/* Transit Polyline */}
              <Polyline
                positions={[originPoint, destPoint]}
                color="#1d4ed8"
                weight={4}
                opacity={0.8}
                dashArray={booking.status === 'DELIVERED' ? undefined : '6, 6'}
              />

              {/* Vehicle Current Position */}
              <Marker position={vehiclePos} icon={vehicleIcon}>
                <Popup>
                  <strong>{booking.provider?.company_name}</strong><br />
                  Vehicle: {booking.vehicle?.vehicle_number}<br />
                  Status: {booking.status}
                </Popup>
              </Marker>
            </MapContainer>

            {/* Map Overlay Badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs rounded-md px-3 py-1.5 text-[11px] font-medium z-[1000] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulated GPS Telemetry • OpenStreetMap Core</span>
            </div>
          </div>

          {/* Quick Carrier Snapshot */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="card p-3">
              <span className="text-slate-400 font-medium">Assigned Carrier</span>
              <div className="font-bold text-slate-900 mt-0.5">{booking.provider?.company_name}</div>
              <div className="text-[10px] text-slate-500">Rating: {booking.provider?.provider_rating} ★</div>
            </div>
            <div className="card p-3">
              <span className="text-slate-400 font-medium">Allocated Vehicle</span>
              <div className="font-bold text-slate-900 mt-0.5">{booking.vehicle?.vehicle_number || 'TN33AB1001'}</div>
              <div className="text-[10px] text-slate-500">{booking.vehicle?.vehicle_type} ({booking.vehicle?.fuel_type})</div>
            </div>
            <div className="card p-3">
              <span className="text-slate-400 font-medium">Commercial Rate</span>
              <div className="font-bold text-slate-900 mt-0.5">₹{Math.round(booking.quoted_price).toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">5% Platform Fee Included</div>
            </div>
          </div>
        </div>

        {/* RIGHT 1 COL: VERTICAL TIMELINE */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Delivery Timeline</span>
              <span className="text-xs font-semibold text-blue-700">
                {Math.round(progressRatio * 100)}% Complete
              </span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {TIMELINE_STAGES.map((stg, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stg.key} className="relative group">
                    <div
                      className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                        isCurrent
                          ? 'bg-blue-700 text-white border-blue-700 ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-300 border-slate-300'
                      }`}
                    >
                      {isPassed ? '✓' : ''}
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-blue-900' : isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {stg.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{stg.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Rate Delivery Experience</h3>
              <p className="text-xs text-slate-500">Carrier: {booking.provider?.company_name} • Booking #{booking.id}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Overall Carrier Rating</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className={`p-1.5 rounded-md text-lg ${
                        star <= ratingVal ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{ratingVal} / 5 Stars</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="label">Timeliness</label>
                  <select
                    value={timelinessVal}
                    onChange={(e) => setTimelinessVal(Number(e.target.value))}
                    className="input-field"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                  </select>
                </div>
                <div>
                  <label className="label">Cargo Care</label>
                  <select
                    value={serviceVal}
                    onChange={(e) => setServiceVal(Number(e.target.value))}
                    className="input-field"
                  >
                    <option value={5}>5 - Intact & Secure</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Acceptable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Feedback Remarks</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRatingModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRatingSubmit}
                className="btn-primary text-xs"
              >
                Submit Carrier Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
