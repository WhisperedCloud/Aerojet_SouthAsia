'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore, SearchQuery } from '@/store/useFlightStore';
import { Search, MapPin, Calendar, Users, ArrowRightLeft, ArrowRight, Plane } from 'lucide-react';
import CustomDatePicker from '@/components/Shared/CustomDatePicker';

const MagicRings = dynamic(() => import('@/components/Shared/MagicRings'), { ssr: false });

const AIRPORTS = [
  { code: 'JFK', name: 'New York' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'ORD', name: 'Chicago' },
  { code: 'MIA', name: 'Miami' },
  { code: 'SFO', name: 'San Francisco' },
  { code: 'SEA', name: 'Seattle' },
  { code: 'DFW', name: 'Dallas' },
  { code: 'DEN', name: 'Denver' },
];

// ── Animated number counter ──────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const iv = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(iv); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(iv);
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function Home() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();

  const [screen, setScreen] = useState<'gate' | 'search'>('gate');
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LAX');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState('');
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchQuery) {
      setOrigin(searchQuery.origin);
      setDestination(searchQuery.destination);
      setDate(searchQuery.date);
      setPassengers(searchQuery.passengers);
    } else {
      const t = new Date(); t.setDate(t.getDate() + 1);
      setDate(t.toISOString().split('T')[0]);
    }
    if (sessionStorage.getItem('aj_launched') === '1') setScreen('search');
  }, [searchQuery]);

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => {
      setScreen('search');
      sessionStorage.setItem('aj_launched', '1');
      setEntering(false);
    }, 600);
  };

  const handleSwap = () => { setOrigin(destination); setDestination(origin); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (origin === destination) { setError('Origin and destination must differ.'); return; }
    const q: SearchQuery = { origin, destination, date, passengers };
    setSearchQuery(q);
    router.push(`/flights?origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}`);
  };

  /* ═══════════════════════════════════════
     GATE / SPLASH PAGE
  ═══════════════════════════════════════ */
  if (screen === 'gate') return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'rgba(7, 8, 15, 0.1)',
        opacity: entering ? 0 : 1,
        transform: entering ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* WebGL rings — full-screen */}
      {mounted && (
        <div className="absolute inset-0 z-0">
          <MagicRings
            color="#f5a623" colorTwo="#00d4aa"
            ringCount={6} speed={0.5} attenuation={9}
            lineThickness={2} baseRadius={0.2} radiusStep={0.12}
            scaleRate={0.12} opacity={0.88} noiseAmount={0.03}
            followMouse={true} mouseInfluence={0.14}
            hoverScale={1.1} parallax={0.035} clickBurst={true}
          />
        </div>
      )}

      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 65%)' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center gap-8">

        {/* Logo pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full animate-fade-in"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.18)', animationDelay: '0.1s' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f5a623,#e8810a)' }}>
            <Plane style={{ width: 13, height: 13, color: '#07080f' }} />
          </div>
          <span className="text-sm font-bold gradient-gold tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AeroJet
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1
            className="text-6xl sm:text-8xl font-black tracking-tight text-white leading-none"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Fly<br />
            <span className="gradient-gold">Smarter.</span>
          </h1>
        </div>

        {/* Sub */}
        <p className="text-gray-500 text-base sm:text-lg max-w-xs animate-slide-up" style={{ animationDelay: '0.3s' }}>
          Book flights, pick seats, manage trips — all in real‑time.
        </p>

        {/* CTA */}
        <button
          onClick={handleEnter}
          className="animate-slide-up group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-[#07080f] btn-gold"
          style={{ animationDelay: '0.4s' }}
        >
          Book a Flight
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Stats row */}
        <div className="flex items-center gap-8 animate-slide-up" style={{ animationDelay: '0.55s' }}>
          {[
            { n: 200, s: '+', label: 'Flights' },
            { n: 8,   s: '',  label: 'Hubs' },
            { n: 98,  s: '%', label: 'On-Time' },
          ].map(({ n, s, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-black gradient-gold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {mounted ? <Counter target={n} suffix={s} /> : `${n}${s}`}
              </div>
              <div className="text-[11px] text-gray-600 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[11px] text-gray-700 tracking-widest uppercase animate-fade-in"
        style={{ animationDelay: '0.8s' }}>
        Real-time · Secure · Offline-ready
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     BOOKING SEARCH CONSOLE
  ═══════════════════════════════════════ */
  return (
    <div className="relative min-h-[80vh] flex items-center">
      {/* Subtle background rings */}
      {mounted && (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.2 }}>
          <MagicRings color="#f5a623" colorTwo="#00d4aa" ringCount={3} speed={0.25}
            attenuation={15} lineThickness={1.2} baseRadius={0.3} radiusStep={0.08}
            scaleRate={0.06} opacity={0.5} noiseAmount={0.02} />
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-10">

        {/* Back link */}
        <button onClick={() => { sessionStorage.removeItem('aj_launched'); setScreen('gate'); }}
          className="mb-8 flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-400 transition font-medium">
          <Plane className="h-3.5 w-3.5 -rotate-45" />
          AeroJet Gate
        </button>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Where are you flying?
          </h1>
          <p className="text-gray-600 text-sm">Choose your route, date, and passengers.</p>
        </div>

        {/* Search card */}
        <div className="rounded-2xl"
          style={{ background: 'rgba(13,15,30,0.85)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
          {/* accent line */}
          <div className="h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#f5a623,#00d4aa)' }} />

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-5">
              {/* Route row */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" style={{ color: '#f5a623' }} /> From
                  </label>
                  <select value={origin} onChange={e => setOrigin(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {AIRPORTS.map(a => (
                      <option key={a.code} value={a.code} style={{ background: '#0d0f1e' }}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="button" onClick={handleSwap}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition hover:scale-110 active:scale-95 mb-0.5"
                  style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', color: '#f5a623' }}>
                  <ArrowRightLeft className="h-4 w-4" />
                </button>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" style={{ color: '#00d4aa' }} /> To
                  </label>
                  <select value={destination} onChange={e => setDestination(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {AIRPORTS.map(a => (
                      <option key={a.code} value={a.code} style={{ background: '#0d0f1e' }}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date + Passengers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" style={{ color: '#f5a623' }} /> Date
                  </label>
                  <CustomDatePicker
                    value={date} 
                    onChange={setDate}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <Users className="h-3 w-3" style={{ color: '#00d4aa' }} /> Passengers
                  </label>
                  <div className="flex items-center rounded-xl h-[50px] px-3 gap-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <button type="button" onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-bold transition text-lg leading-none"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>−</button>
                    <span className="flex-1 text-center text-white font-semibold">{passengers}</span>
                    <button type="button" onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-bold transition text-lg leading-none"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>+</button>
                  </div>
                </div>
              </div>

              {/* Search button */}
              <button type="submit" id="search-flights-btn"
                className="w-full py-4 rounded-xl font-bold text-sm text-[#07080f] btn-gold flex items-center justify-center gap-2">
                <Search className="h-4 w-4" />
                Search Flights
              </button>
            </form>
          </div>
        </div>

        {/* Quick routes */}
        <div className="mt-6">
          <p className="text-[11px] text-gray-700 uppercase tracking-widest mb-3">Popular routes</p>
          <div className="flex flex-wrap gap-2">
            {[
              { from: 'JFK', to: 'LAX' }, { from: 'SFO', to: 'SEA' },
              { from: 'MIA', to: 'JFK' }, { from: 'ORD', to: 'MIA' },
              { from: 'DFW', to: 'DEN' }, { from: 'LAX', to: 'SFO' },
            ].map(r => (
              <button key={`${r.from}-${r.to}`}
                onClick={() => { setOrigin(r.from); setDestination(r.to); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105 active:scale-95"
                style={{
                  background: origin === r.from && destination === r.to
                    ? 'rgba(245,166,35,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  border: origin === r.from && destination === r.to
                    ? '1px solid rgba(245,166,35,0.35)'
                    : '1px solid rgba(255,255,255,0.06)',
                  color: origin === r.from && destination === r.to ? '#f5a623' : '#6b7280',
                }}>
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
