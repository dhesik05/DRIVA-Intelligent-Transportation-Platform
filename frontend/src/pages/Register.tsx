import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { authApi } from '../api';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'BUSINESS_OWNER', label: 'Business Owner — I need transportation for my goods' },
  { value: 'FLEET_OWNER', label: 'Fleet Owner — I own vehicles and provide transportation' },
  { value: 'LOGISTICS_AGENCY', label: 'Logistics Agency — I manage transport providers' },
  { value: 'DRIVER', label: 'Driver — I drive and deliver cargo' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'BUSINESS_OWNER' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="DRIVA" className="w-10 h-10 rounded object-cover shadow-xs" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">DRIVA</span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join DRIVA Transportation Intelligence Platform</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" type="text" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input-field" type="email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input-field" type="tel"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input-field" type="password" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label">Account Type</label>
              <select className="input-field" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
