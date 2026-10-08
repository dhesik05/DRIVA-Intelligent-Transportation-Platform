import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Menu, X, ChevronRight, BarChart3, MapPin, Shield, Zap, Clock, TrendingUp } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white shadow-sm border-b border-slate-200' : 'bg-white border-b border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="DRIVA Logo" className="w-9 h-9 rounded object-cover shadow-2xs" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">DRIVA</span>
                <span className="text-[9px] text-blue-700 font-bold tracking-wider uppercase">Every journey. More useful.</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <a href="#how" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#business" className="hover:text-slate-900 transition-colors">For Businesses</a>
              <a href="#fleet" className="hover:text-slate-900 transition-colors">For Fleet Owners</a>
              <a href="#model" className="hover:text-slate-900 transition-colors">Pricing</a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
            </div>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
            <a href="#how" className="block text-sm text-slate-600">How It Works</a>
            <a href="#business" className="block text-sm text-slate-600">For Businesses</a>
            <a href="#fleet" className="block text-sm text-slate-600">For Fleet Owners</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary btn-sm flex-1 justify-center">Login</Link>
              <Link to="/register" className="btn-primary btn-sm flex-1 justify-center">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-blue-200">
              <Zap className="w-3 h-3" />
              B2B Transportation Intelligence Platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Intelligent Transportation<br />
              <span className="text-blue-700">Procurement for Business</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Stop calling multiple agencies to find transportation. DRIVA analyzes available providers,
              predicts cost and delivery time, and recommends the best option for every shipment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/register')} className="btn-primary px-6 py-3 text-base">
                Request Transportation
                <ChevronRight className="w-4 h-4" />
              </button>
              <a href="#how" className="btn-secondary px-6 py-3 text-base justify-center">
                How DRIVA Works
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Active Providers', value: '4+', icon: Shield },
              { label: 'Route Coverage', value: '10+ Routes', icon: MapPin },
              { label: 'Match Accuracy', value: '94%', icon: TrendingUp },
              { label: 'Avg. Time Saved', value: '2+ Hours', icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card p-4">
                <Icon className="w-5 h-5 text-blue-600 mb-2" />
                <div className="text-xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="section-title text-blue-700 mb-3">The Problem</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Transportation discovery is fragmented</h2>
            <p className="text-slate-600 mb-6">
              When a business needs to move goods, they face a time-consuming manual process:
            </p>
            <div className="space-y-3">
              {[
                'Call Agency 1 — check availability, ask price',
                'Call Agency 2 — check availability, ask price',
                'Call Agency 3 — check availability, ask price',
                'Manually compare delivery times and costs',
                'Make a decision without complete information',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                    {i + 1}
                  </div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-title text-blue-700 mb-3">How DRIVA Works</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-10">From request to delivery in one platform</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create Request', desc: 'Enter pickup, destination, cargo weight, and deadline.' },
              { step: '02', title: 'DRIVA Searches', desc: 'Platform finds available vehicles and providers instantly.' },
              { step: '03', title: 'ML Prediction', desc: 'AI models predict delivery cost and estimated time.' },
              { step: '04', title: 'Smart Ranking', desc: 'Decision engine scores and ranks providers on 7 criteria.' },
              { step: '05', title: 'Book Instantly', desc: 'Select recommended option and confirm booking.' },
              { step: '06', title: 'Track & Rate', desc: 'Monitor delivery status and rate provider performance.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card p-5">
                <div className="text-xs font-bold text-blue-600 mb-2">{step}</div>
                <div className="font-semibold text-slate-900 mb-1">{title}</div>
                <div className="text-sm text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Match Example */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-title text-blue-700 mb-3">Smart Match</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Example: Salem → Bangalore, 200 kg</h2>
          <p className="text-slate-500 text-sm mb-8">DRIVA analyzes all available options and recommends the best fit.</p>

          <div className="grid lg:grid-cols-3 gap-4">
            {[
              { name: 'ABC Logistics', score: 94, cost: '₹4,800', eta: '7 hrs', capacity: '700 kg', rel: '94%', recommended: true },
              { name: 'SouthLine Transport', score: 81, cost: '₹5,300', eta: '6 hrs', capacity: '500 kg', rel: '89%', recommended: false },
              { name: 'GreenRoute Mobility', score: 74, cost: '₹4,600', eta: '9 hrs', capacity: '400 kg', rel: '87%', recommended: false },
            ].map((p) => (
              <div key={p.name} className={`card p-5 ${p.recommended ? 'ring-2 ring-blue-600' : ''}`}>
                {p.recommended && (
                  <div className="badge badge-blue mb-3">⭐ DRIVA Recommended</div>
                )}
                <div className="font-semibold text-slate-900 mb-3">{p.name}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Match Score</span>
                    <span className={`font-bold ${p.recommended ? 'text-blue-700' : 'text-slate-700'}`}>{p.score}/100</span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">Cost</span><span>{p.cost}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ETA</span><span>{p.eta}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span>{p.capacity}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Reliability</span><span>{p.rel}</span></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">* Scores are calculated dynamically by DRIVA's ML pipeline and decision engine — not hardcoded.</p>
        </div>
      </section>

      {/* For Businesses */}
      <section id="business" className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="section-title text-blue-700 mb-3">For Businesses</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Smarter transportation procurement</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  'Find available transportation in seconds, not hours',
                  'Compare cost, ETA, capacity, and reliability in one view',
                  'AI-recommended best option based on your requirements',
                  'Centralized booking and delivery tracking',
                  'Analytics to optimize transportation spend over time',
                ].map(p => <li key={p} className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>{p}
                </li>)}
              </ul>
            </div>
            <div id="fleet">
              <div className="section-title text-blue-700 mb-3">For Fleet Owners & Agencies</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">More visibility, better utilization</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  'Receive transportation requests matched to your capacity',
                  'Manage your vehicle fleet from one dashboard',
                  'Track delivery jobs and update status in real time',
                  'Build verified ratings and provider reliability score',
                  'Fleet analytics to understand utilization and revenue',
                ].map(p => <li key={p} className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>{p}
                </li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="model" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-title text-blue-700 mb-3">Business Model</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Transparent pricing</h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl">
            {[
              { plan: 'Starter', price: '₹999/mo', features: ['Basic transport requests', 'Provider comparison', 'Booking history'] },
              { plan: 'Business', price: '₹2,999/mo', features: ['AI recommendations', 'Analytics', 'Multiple users', 'Cost analysis'], highlight: true },
              { plan: 'Enterprise', price: 'Custom', features: ['API integration', 'Advanced analytics', 'Multi-location', 'Dedicated support'] },
            ].map(({ plan, price, features, highlight }) => (
              <div key={plan} className={`card p-5 ${highlight ? 'ring-2 ring-blue-600' : ''}`}>
                {highlight && <div className="badge badge-blue mb-2">Most Popular</div>}
                <div className="font-bold text-slate-900">{plan}</div>
                <div className="text-2xl font-bold text-blue-700 mt-1 mb-4">{price}</div>
                <ul className="space-y-2 text-sm text-slate-600">
                  {features.map(f => <li key={f} className="flex items-start gap-2"><span className="text-emerald-600">✓</span>{f}</li>)}
                </ul>
                <button onClick={() => navigate('/register')} className={`mt-5 w-full ${highlight ? 'btn-primary' : 'btn-secondary'} justify-center`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">+ 5% DRIVA Service Fee on each completed booking. Demo only — no real payments.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-700 border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to simplify your transportation?
          </h2>
          <p className="text-blue-200 mb-8 text-sm">Join DRIVA and get intelligent transportation recommendations for every shipment.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/register')} className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-md text-sm hover:bg-blue-50 transition-colors">
              Get Started Free
            </button>
            <button onClick={() => navigate('/login')} className="border border-blue-400 text-white font-medium px-6 py-3 rounded-md text-sm hover:bg-blue-600 transition-colors">
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="DRIVA Logo" className="w-8 h-8 rounded-md bg-white object-contain p-0.5 shadow-xs" />
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-base tracking-tight leading-none">DRIVA</span>
                <span className="text-[10px] text-slate-400">Dynamic Routing, Intelligence & Vehicle Allocation</span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Hackathon MVP — Smart Cities & Mobility · "Every Journey. More Useful."
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
