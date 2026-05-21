'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, KeyRound, Mail, AlertCircle, CheckCircle, Plane, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

/* ── Demo credentials strip ── */
const DEMO_ACCOUNTS = [
  { name: 'Alex Turner', email: 'alex.turner@aerojet.demo', password: 'AeroJet#2026' },
  { name: 'Sarah Chen',  email: 'sarah.chen@aerojet.demo',  password: 'AeroJet#2026' },
  { name: 'James Patel', email: 'james.patel@aerojet.demo',  password: 'AeroJet#2026' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [fullName, setFullName]         = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [message, setMessage]           = useState('');

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    setMessage('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    try {
      if (isRegistering) {
        const { error: regErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + '/auth/callback',
          },
        });
        if (regErr) throw regErr;
        setMessage('Account created! Check your email to confirm, then sign in.');
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) throw loginErr;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* ── LEFT: Branding panel ── */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 pr-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f5a623,#e8810a)', boxShadow: '0 8px 24px rgba(245,166,35,0.35)' }}>
              <Plane style={{ width: 22, height: 22, color: '#07080f' }} />
            </div>
            <span className="text-2xl font-black gradient-gold" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>AeroJet</span>
          </div>

          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>
              {isRegistering ? 'Join the fleet.' : 'Welcome back,\nco-pilot.'}
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              {isRegistering
                ? 'Create your AeroJet account to lock premium seats, manage itineraries, and fly smarter.'
                : 'Sign in to access real-time seat maps, your booking history, and instant rescheduling.'}
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-4">
            {[
              { icon: '🛫', title: 'Live Seat Maps',    desc: 'Real-time cabin occupancy synced via Supabase Realtime' },
              { icon: '🔒', title: 'Secure Booking',    desc: 'Transactional RPCs with row-level locking' },
              { icon: '📶', title: 'Offline First',     desc: 'PWA service worker keeps your itinerary available everywhere' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Auth form ── */}
        <div>
          <div className="rounded-2xl overflow-hidden relative"
            style={{ background: 'rgba(13,15,30,0.85)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
            {/* Top accent */}
            <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg,#f5a623,#00d4aa,#7c5cbf)' }} />

            <div className="p-6 sm:p-8">
              {/* Form heading */}
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>
                  {isRegistering ? 'Create your account' : 'Sign in to AeroJet'}
                </h1>
                <p className="text-xs text-gray-500">
                  {isRegistering ? 'Fill in your details to get started' : 'Enter your credentials to continue'}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  <AlertCircle className="h-4 w-4 shrink-0" style={{ color: '#f87171' }} />
                  {error}
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: '#6ee7d1' }}>
                  <CheckCircle className="h-4 w-4 shrink-0" style={{ color: '#00d4aa' }} />
                  {message}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {/* Full name (register only) */}
                {isRegistering && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" /> Full Name
                    </label>
                    <input type="text" required={isRegistering} value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Alex Turner"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email Address
                  </label>
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="h-3 w-3" /> Password
                  </label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:outline-none transition"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {isRegistering && (
                    <p className="text-[10px] text-gray-600">Minimum 6 characters</p>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition mt-2 text-[#07080f] btn-gold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <><LogIn className="h-4 w-4" /> {isRegistering ? 'Create Account' : 'Sign In'}</>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <div className="mt-5 pt-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button type="button"
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); setMessage(''); }}
                  className="text-xs font-medium transition flex items-center gap-1 mx-auto"
                  style={{ color: '#f5a623' }}>
                  {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Demo accounts panel ── */}
          {!isRegistering && (
            <div className="mt-4 rounded-2xl p-4"
              style={{ background: 'rgba(13,15,30,0.6)', border: '1px solid rgba(245,166,35,0.12)' }}>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-4 h-[1px] inline-block" style={{ background: '#f5a623' }} />
                Demo Accounts — Click to Auto-Fill
                <span className="w-4 h-[1px] inline-block" style={{ background: '#f5a623' }} />
              </div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button key={acc.email} onClick={() => fillDemo(acc)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition group hover:scale-[1.01]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-[#07080f]"
                        style={{ background: 'linear-gradient(135deg,#f5a623,#e8810a)' }}>
                        {acc.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{acc.name}</div>
                        <div className="text-[10px] text-gray-600">{acc.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-amber-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.1)', borderTop: '2px solid #f5a623' }} />
        <p className="text-gray-600 text-sm">Loading secure gateway...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
