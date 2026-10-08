import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('driva2024');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="DRIVA" className="w-10 h-10 rounded object-cover shadow-xs" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">DRIVA</span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Sign in to your account</h1>
          <p className="text-sm text-slate-500 mt-1">DRIVA Transportation Intelligence Platform</p>
        </div>

        <div className="card p-6">
          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-5">
            <div className="text-xs font-semibold text-blue-700 mb-2">Demo Accounts (password: driva2024)</div>
            <div className="flex flex-wrap gap-2">
              {[
                ['business@driva.demo', 'Business'],
                ['fleet@driva.demo', 'Fleet'],
                ['agency@driva.demo', 'Agency'],
                ['driver@driva.demo', 'Driver'],
                ['admin@driva.demo', 'Admin'],
              ].map(([e, label]) => (
                <button key={e} onClick={() => demoLogin(e)}
                  className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" className="input-field" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input-field" value={password}
                onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
