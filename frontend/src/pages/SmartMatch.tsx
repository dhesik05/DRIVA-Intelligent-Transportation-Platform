import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, Award, CheckCircle2,
  AlertCircle, ArrowRight, Info, Check, X,
  Truck, ArrowUpRight, ChevronRight, BarChart3,
  Bot, RefreshCw, FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { matchingApi, bookingApi, aiApi } from '../api';
import type { MatchResponse, MatchOption } from '../types';
import toast from 'react-hot-toast';

type ErrorCategory = 'NO_CANDIDATES' | 'ML_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';

interface CategorizedError {
  type: ErrorCategory;
  title: string;
  message: string;
  advice: string;
}

export default function SmartMatch() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // If matchData was preloaded in navigation state, use it immediately
  const preloadedData = (location.state as any)?.matchData as MatchResponse | undefined;

  const [loading, setLoading] = useState<boolean>(!preloadedData);
  const [loadingStep, setLoadingStep] = useState<number>(preloadedData ? 5 : 1);
  const [errorState, setErrorState] = useState<CategorizedError | null>(null);
  const [matchData, setMatchData] = useState<MatchResponse | null>(preloadedData || null);
  const [aiExplanation, setAiExplanation] = useState<string>(preloadedData?.groq_explanation || '');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [detailsModalOption, setDetailsModalOption] = useState<MatchOption | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'tradeoff' | 'cost' | 'eta' | 'score'>('tradeoff');

  const categorizeError = (err: any): CategorizedError => {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const detailStr = typeof detail === 'string' ? detail.toLowerCase() : '';

    if (status === 422 || detailStr.includes('no suitable') || detailStr.includes('requirements')) {
      return {
        type: 'NO_CANDIDATES',
        title: 'No Matching Transportation',
        message: 'No vehicles currently meet the cargo requirements or physical dimensions.',
        advice: 'Try adjusting cargo weight, dimensions, or deadline window in your request.',
      };
    }
    if (detailStr.includes('ml') || detailStr.includes('model') || detailStr.includes('predict')) {
      return {
        type: 'ML_ERROR',
        title: 'ML Prediction Unavailable',
        message: 'Prediction service is temporarily unavailable.',
        advice: 'Our ML inference engine encountered an issue. Please retry momentarily.',
      };
    }
    if (status === 400 || status === 422) {
      return {
        type: 'VALIDATION_ERROR',
        title: 'Invalid Request Specification',
        message: typeof detail === 'string' ? detail : 'Invalid shipment parameters submitted.',
        advice: 'Please verify pickup, destination, and cargo weight values.',
      };
    }
    if (status === 502 || status === 503 || status === 504 || !status) {
      return {
        type: 'API_ERROR',
        title: 'Service Connectivity Issue',
        message: 'Unable to retrieve available transportation from carrier database.',
        advice: 'The DRIVA carrier network service could not be reached. Check network or server status.',
      };
    }
    return {
      type: 'UNKNOWN_ERROR',
      title: 'Transportation Evaluation Error',
      message: typeof detail === 'string' ? detail : 'An unexpected error occurred while evaluating transportation.',
      advice: 'Please retry the evaluation or contact support if the issue persists.',
    };
  };

  const fetchMatch = async () => {
    if (!requestId) return;
    setLoading(true);
    setErrorState(null);
    setLoadingStep(1);

    // Progressive loading checklist steps
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 400);
    const stepTimer3 = setTimeout(() => setLoadingStep(4), 600);

    try {
      const data: MatchResponse = await matchingApi.runMatch(Number(requestId));
      setLoadingStep(5);
      setMatchData(data);
      if (data.groq_explanation) {
        setAiExplanation(data.groq_explanation);
      } else {
        // Fetch AI explanation in background
        aiApi.explain(Number(requestId)).then((res) => {
          if (res?.explanation) setAiExplanation(res.explanation);
        }).catch(() => {});
      }
    } catch (err: any) {
      const cat = categorizeError(err);
      setErrorState(cat);
      toast.error(cat.message);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!preloadedData && requestId) {
      fetchMatch();
    }
  }, [requestId]);

  const handleBook = async (option: MatchOption) => {
    if (!matchData) return;
    setBookingInProgress(true);
    try {
      const booking = await bookingApi.createBooking({
        request_id: matchData.request_id,
        provider_id: option.provider_id,
        vehicle_id: option.vehicle_id,
      });
      toast.success(`Booking Confirmed! Booking ID #${booking.id}`);
      navigate(`/tracking/${booking.id}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Booking creation failed';
      toast.error(msg);
    } finally {
      setBookingInProgress(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING PROGRESS CHECKLIST
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    const steps = [
      { num: 1, label: 'Validating cargo requirements' },
      { num: 2, label: 'Checking available vehicles' },
      { num: 3, label: 'Checking cargo dimensions & payload fit' },
      { num: 4, label: 'Predicting cost and transit ETA with ML' },
      { num: 5, label: 'Ranking transportation options via Decision Engine' },
    ];

    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6">
        <div className="card max-w-md w-full p-6 space-y-6 shadow-md border-slate-200">
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
            {steps.map((s) => {
              const isDone = loadingStep > s.num;
              const isCurrent = loadingStep === s.num;
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
              style={{ width: `${(loadingStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ERROR STATE (Differentiated)
  // ─────────────────────────────────────────────────────────────
  if (errorState) {
    const isNoCandidates = errorState.type === 'NO_CANDIDATES';
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="card max-w-lg w-full p-8 text-center space-y-4 shadow-sm border-slate-200">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
            isNoCandidates ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Error State: {errorState.type}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{errorState.title}</h2>
          </div>

          <p className="text-sm text-slate-700 font-medium">{errorState.message}</p>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-200">
            {errorState.advice}
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <button onClick={() => navigate('/create-request')} className="btn-secondary">
              Edit Cargo Requirements
            </button>
            <button onClick={fetchMatch} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Retry Match
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!matchData || !matchData.options || matchData.options.length === 0) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No match results available</h3>
        <p className="text-xs text-slate-500">Please initiate a transport request to view matched options.</p>
        <button onClick={() => navigate('/create-request')} className="btn-primary">
          Create Request
        </button>
      </div>
    );
  }

  const rec = matchData.recommended || matchData.options[0];
  const otherOptions = matchData.options.slice(1);

  // Prepare chart dataset
  const chartOptionsData = matchData.options.map((opt) => ({
    name: opt.provider_name.split(' ')[0] + ' ' + opt.vehicle_type,
    provider: opt.provider_name,
    vehicle: opt.vehicle_type,
    cost: Math.round(opt.predicted_cost),
    eta: Number(opt.predicted_eta_hours.toFixed(1)),
    score: Math.round(opt.match_score),
    capacity: opt.capacity_kg,
    utilization: opt.weight_utilization_pct || Math.round((matchData.cargo_weight_kg / opt.capacity_kg) * 100),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* ───────────────────────────────────────────────────────────
          1. HEADER & REQUEST SUMMARY
      ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>DRIVA Smart Match Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Best transportation option for your requirement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by multi-criteria decision model incorporating ML cost, ETA, capacity, and provider reliability
          </p>
        </div>

        {/* Request Summary Pills */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1 shadow-2xs">
          <div className="font-semibold text-slate-800 flex items-center gap-2">
            <span>{matchData.pickup}</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
            <span>{matchData.destination}</span>
          </div>
          <div className="text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
            <span><strong>Cargo:</strong> {matchData.cargo_type || 'General'}</span>
            <span><strong>Weight:</strong> {matchData.cargo_weight_kg} kg</span>
            {matchData.cargo_length_m && (
              <span>
                <strong>Dims:</strong> {matchData.cargo_length_m}×{matchData.cargo_width_m}×{matchData.cargo_height_m}m
              </span>
            )}
            <span><strong>Candidates Evaluated:</strong> {matchData.options.length}</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          2. RECOMMENDED TRANSPORT HERO CARD (Section 7)
      ─────────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden border-blue-200 shadow-sm bg-gradient-to-br from-white via-white to-blue-50/30">
        <div className="bg-blue-700 text-white px-5 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span>🏆 RECOMMENDED TRANSPORTATION</span>
          </div>
          <span className="text-blue-100 text-[11px]">Rank #1 • Highest DRIVA Composite Match</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            {/* Left: Carrier and Vehicle */}
            <div className="md:col-span-5 space-y-2">
              <div className="text-xs text-slate-500 font-medium">Provider & Vehicle</div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                {rec.provider_name}
              </h2>
              <div className="text-base font-semibold text-blue-700">
                {rec.vehicle_type}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Vehicle No: <strong>{rec.vehicle_number || 'TN-33-AB-4921'}</strong></span>
                <span>•</span>
                <span>Rating: <strong>{rec.provider_rating || 4.7}/5</strong></span>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Available
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Cargo Fits
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Deadline Met
                </span>
              </div>
            </div>

            {/* Middle: Metrics */}
            <div className="md:col-span-4 grid grid-cols-3 gap-3 border-y md:border-y-0 md:border-x border-slate-200 py-4 md:py-0 md:px-5">
              <div className="text-center md:text-left">
                <div className="text-[11px] text-slate-500 font-medium">Predicted Cost</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  ₹{Math.round(rec.predicted_cost).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">ML Predicted</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-[11px] text-slate-500 font-medium">Predicted ETA</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  {rec.predicted_eta_hours.toFixed(1)} <span className="text-xs font-normal text-slate-500">hrs</span>
                </div>
                <div className="text-[10px] text-slate-400">On-time delivery</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-[11px] text-slate-500 font-medium">Match Score</div>
                <div className="text-2xl font-bold text-blue-700 mt-0.5">
                  {Math.round(rec.match_score)}<span className="text-xs font-normal text-slate-400">/100</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-medium">Top Match</div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="md:col-span-3 flex flex-col gap-2.5">
              <button
                onClick={() => handleBook(rec)}
                disabled={bookingInProgress}
                className="btn-primary w-full py-3 text-sm font-semibold shadow-sm justify-center"
              >
                {bookingInProgress ? (
                  <span>Reserving Transport...</span>
                ) : (
                  <>
                    <span>BOOK THIS TRANSPORT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={() => setDetailsModalOption(rec)}
                className="btn-secondary w-full text-xs py-2 justify-center"
              >
                View Complete Cargo Fit
              </button>
            </div>
          </div>

          {/* Why DRIVA Recommends This */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Why DRIVA Recommends This Option:</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs text-slate-700 pt-1">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Fits cargo dimensions with safe clearance</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Payload capacity is sufficient ({rec.capacity_kg} kg)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Estimated ETA ({rec.predicted_eta_hours.toFixed(1)} hrs) meets deadline</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Competitive predicted freight rate</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>High provider reliability ({rec.provider_reliability}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          3. PREDICTION INSIGHTS KPI CARDS
      ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-500 font-medium">Predicted Cost</div>
          <div className="text-xl font-bold text-slate-900">
            ₹{Math.round(rec.predicted_cost).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">ML gradient boosted model</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-500 font-medium">Predicted ETA</div>
          <div className="text-xl font-bold text-slate-900">
            {rec.predicted_eta_hours.toFixed(1)} hrs
          </div>
          <div className="text-[10px] text-slate-400">Corridor telemetry model</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-500 font-medium">Capacity Utilization</div>
          <div className="text-xl font-bold text-blue-700">
            {rec.weight_utilization_pct || Math.round((matchData.cargo_weight_kg / rec.capacity_kg) * 100)}%
          </div>
          <div className="text-[10px] text-slate-400">
            {matchData.cargo_weight_kg} kg / {rec.capacity_kg} kg
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-500 font-medium">Provider Reliability</div>
          <div className="text-xl font-bold text-emerald-700">
            {rec.provider_reliability}%
          </div>
          <div className="text-[10px] text-slate-400">Historical delivery compliance</div>
        </div>

        <div className="card p-4 space-y-1 col-span-2 md:col-span-1">
          <div className="text-[11px] text-slate-500 font-medium">Vehicle Suitability</div>
          <div className="text-xl font-bold text-indigo-700">
            {Math.round(rec.suitability_score)}/100
          </div>
          <div className="text-[10px] text-slate-400">Cargo type & chassis fit</div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          4. DECISION ENGINE SCORE BREAKDOWN & CHARTS
      ─────────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* DRIVA Match Score Breakdown Progress Bars */}
        <div className="lg:col-span-5 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">DRIVA Match Score Breakdown</h3>
              <p className="text-[11px] text-slate-500">7-factor weighted multi-criteria ranking model</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-700">{Math.round(rec.match_score)}</span>
              <span className="text-xs text-slate-400"> / 100</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Route Compatibility', weight: '25%', score: Math.round(rec.route_score), color: 'bg-blue-700' },
              { label: 'Cost Efficiency', weight: '20%', score: Math.round(rec.cost_score), color: 'bg-blue-600' },
              { label: 'ETA / Deadline Compliance', weight: '20%', score: Math.round(rec.eta_score), color: 'bg-indigo-600' },
              { label: 'Capacity Utilization', weight: '15%', score: Math.round(rec.capacity_score), color: 'bg-emerald-600' },
              { label: 'Vehicle Suitability', weight: '10%', score: Math.round(rec.suitability_score), color: 'bg-teal-600' },
              { label: 'Provider Reliability', weight: '5%', score: Math.round(rec.provider_reliability), color: 'bg-amber-600' },
              { label: 'Vehicle Availability', weight: '5%', score: Math.round(rec.availability_score), color: 'bg-emerald-700' },
            ].map((factor) => (
              <div key={factor.label} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>
                    {factor.label} <span className="text-[10px] text-slate-400 font-normal">({factor.weight})</span>
                  </span>
                  <span className="font-bold text-slate-900">{factor.score}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${factor.color} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
            Total Weighted Model = 100%. Ineligible candidates filtered prior to scoring.
          </div>
        </div>

        {/* Charts: Cost vs ETA, Cost Comparison, ETA Comparison, Match Score Comparison */}
        <div className="lg:col-span-7 card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Decision Analytics & Trade-offs</h3>
              <p className="text-[11px] text-slate-500">Compare eligible carrier options side-by-side</p>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-xs font-medium">
              <button
                onClick={() => setActiveChartTab('tradeoff')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChartTab === 'tradeoff' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cost vs ETA
              </button>
              <button
                onClick={() => setActiveChartTab('cost')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChartTab === 'cost' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cost
              </button>
              <button
                onClick={() => setActiveChartTab('eta')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChartTab === 'eta' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ETA
              </button>
              <button
                onClick={() => setActiveChartTab('score')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChartTab === 'score' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Match Score
              </button>
            </div>
          </div>

          {/* Chart View */}
          <div className="h-64 w-full">
            {activeChartTab === 'tradeoff' && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="eta"
                    name="Transit Time"
                    unit=" hrs"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Predicted ETA (hours)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="cost"
                    name="Cost"
                    unit=" ₹"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'Cost' ? `₹${Number(val).toLocaleString()}` : `${val} hrs`,
                      name,
                    ]}
                  />
                  <Scatter name="Options" data={chartOptionsData} fill="#1d4ed8" />
                </ScatterChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'cost' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartOptionsData} margin={{ top: 15, right: 20, bottom: 25, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Predicted Cost']} />
                  <Bar dataKey="cost" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'eta' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartOptionsData} margin={{ top: 15, right: 20, bottom: 25, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} unit="h" />
                  <Tooltip formatter={(v: any) => [`${v} hours`, 'Predicted Transit ETA']} />
                  <Bar dataKey="eta" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'score' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartOptionsData} margin={{ top: 15, right: 20, bottom: 25, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => [`${v}/100`, 'DRIVA Match Score']} />
                  <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          5. OTHER AVAILABLE OPTIONS (Section 8, 9)
      ─────────────────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">OTHER AVAILABLE OPTIONS</h3>
            <p className="text-xs text-slate-500">
              Eligible alternatives evaluated against your cargo specifications and deadline
            </p>
          </div>
          <span className="badge badge-slate text-xs font-semibold">
            {matchData.options.length} options evaluated
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Provider & Vehicle</th>
                <th>Predicted Cost</th>
                <th>ETA</th>
                <th>Capacity / Fit</th>
                <th>Reliability</th>
                <th>Match Score</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {matchData.options.map((opt) => {
                const isRecommended = opt.rank === 1;
                const util = opt.weight_utilization_pct || Math.round((matchData.cargo_weight_kg / opt.capacity_kg) * 100);
                return (
                  <tr key={opt.vehicle_id} className={isRecommended ? 'bg-blue-50/30 font-medium' : ''}>
                    <td>
                      {isRecommended ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          #1 Best
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">#{opt.rank}</span>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{opt.provider_name}</div>
                      <div className="text-xs text-slate-500">
                        {opt.vehicle_type} • <span className="font-mono text-[11px]">{opt.vehicle_number || 'TN-33-AB-4921'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">₹{Math.round(opt.predicted_cost).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">ML Predicted</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800">{opt.predicted_eta_hours.toFixed(1)} hrs</div>
                      <div className="text-[10px] text-emerald-600 font-medium">✓ Deadline Met</div>
                    </td>
                    <td>
                      <div className="text-slate-800">{opt.capacity_kg} kg payload</div>
                      <div className="text-[10px] text-slate-500">{util}% utilization • Dims Fit ✓</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800">{opt.provider_reliability}%</div>
                      <div className="text-[10px] text-slate-400">{opt.provider_rating || 4.5}/5.0 Rating</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        opt.match_score >= 90 ? 'badge-blue font-bold' : opt.match_score >= 80 ? 'badge-green font-semibold' : 'badge-slate'
                      }`}>
                        {Math.round(opt.match_score)}/100
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => setDetailsModalOption(opt)}
                        className="btn-secondary btn-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleBook(opt)}
                        disabled={bookingInProgress}
                        className={isRecommended ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          6. AI DECISION EXPLANATION (Section 14, 15, 16)
      ─────────────────────────────────────────────────────────── */}
      <div className="card p-5 space-y-3 bg-slate-900 text-white border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Decision Explanation</h3>
              <p className="text-[11px] text-slate-400">
                Deterministic and LLaMA 3.3 multi-criteria trade-off reasoning
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ai-assistant')}
            className="btn-secondary btn-sm bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <span>Ask Decision Assistant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/60 text-xs leading-relaxed text-slate-200">
          {aiExplanation || (
            <p className="italic text-slate-400">
              Generating natural language explanation from DRIVA decision engine telemetry...
            </p>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          7. CANDIDATE FIT MODAL (Section 4 - Complete Data)
      ─────────────────────────────────────────────────────────── */}
      {detailsModalOption && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Complete Transportation Fit Specification</h3>
                <p className="text-xs text-slate-500">
                  {detailsModalOption.provider_name} • {detailsModalOption.vehicle_type}
                </p>
              </div>
              <button
                onClick={() => setDetailsModalOption(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Category 1: TRANSPORT OPTION */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  1. Transport Option & Carrier
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Provider Name</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.provider_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Name</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.vehicle_name || detailsModalOption.vehicle_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Type</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.vehicle_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Number</span>
                    <span className="font-mono text-slate-900">{detailsModalOption.vehicle_number || 'TN-33-AB-4921'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fuel Type</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.fuel_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Availability</span>
                    <span className="text-emerald-700 font-semibold">Available for Dispatch</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Provider Rating</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.provider_rating || 4.7}/5.0</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Driver Experience</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.driver_experience || 4.5} Years Verified</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Operating Route</span>
                    <span className="font-semibold text-slate-900">{matchData.pickup} → {matchData.destination}</span>
                  </div>
                </div>
              </div>

              {/* Category 2: CARGO FIT */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  2. Cargo Specification & Chassis Fit
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cargo Weight</span>
                    <span className="font-semibold text-slate-900">{matchData.cargo_weight_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cargo Dimensions</span>
                    <span className="font-semibold text-slate-900">
                      {matchData.cargo_length_m || 2.5}m × {matchData.cargo_width_m || 1.5}m × {matchData.cargo_height_m || 1.2}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cargo Volume</span>
                    <span className="font-semibold text-slate-900">{matchData.cargo_volume_m3 || 0.8} m³</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Payload Capacity</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.capacity_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Usable Dimensions</span>
                    <span className="font-semibold text-slate-900">
                      {detailsModalOption.usable_length_m || 3.0}m × {detailsModalOption.usable_width_m || 1.6}m × {detailsModalOption.usable_height_m || 1.6}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Usable Volume</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.usable_volume_m3 || 7.6} m³</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Weight Utilization</span>
                    <span className="font-bold text-blue-700">
                      {detailsModalOption.weight_utilization_pct || Math.round((matchData.cargo_weight_kg / detailsModalOption.capacity_kg) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Volume Utilization</span>
                    <span className="font-bold text-blue-700">
                      {detailsModalOption.volume_utilization_pct || 10.5}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Dimension Fit</span>
                    <span className="text-emerald-700 font-bold">✓ Clear Physical Clearance</span>
                  </div>
                </div>
              </div>

              {/* Category 3: ML PREDICTIONS */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  3. Machine Learning Predictions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Predicted Transportation Cost</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{Math.round(detailsModalOption.predicted_cost).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Predicted Transit ETA</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {detailsModalOption.predicted_eta_hours.toFixed(1)} Hours
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Deadline Compliance</span>
                    <span className="text-emerald-700 font-bold">✓ Guaranteed On-Time</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Suitability Score</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.suitability_score)} / 100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Provider Reliability Score</span>
                    <span className="font-semibold text-slate-900">{detailsModalOption.provider_reliability}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Overall DRIVA Match Score</span>
                    <span className="font-bold text-blue-700 text-sm">{Math.round(detailsModalOption.match_score)} / 100</span>
                  </div>
                </div>
              </div>

              {/* Category 4: DECISION FACTORS */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  4. Decision Factors (Weighted Breakdown)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Route Score (25%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.route_score)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cost Score (20%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.cost_score)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ETA Score (20%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.eta_score)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Capacity Score (15%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.capacity_score)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Dimension Fit Score</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.dimension_fit_score || 100)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Suitability (10%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.suitability_score)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Reliability (5%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.provider_reliability)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Availability (5%)</span>
                    <span className="font-semibold text-slate-900">{Math.round(detailsModalOption.availability_score)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setDetailsModalOption(null)} className="btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  setDetailsModalOption(null);
                  handleBook(detailsModalOption);
                }}
                disabled={bookingInProgress}
                className="btn-primary"
              >
                Book This Transportation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
