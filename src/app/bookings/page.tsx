'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, BookingCache } from '@/store/useUserStore';
import { supabase } from '@/lib/supabaseClient';
import {
  Ticket, Plane, AlertTriangle, XCircle, RefreshCw,
  AlertCircle, Loader2, ArrowRight, Search,
} from 'lucide-react';
import { FormattedTime, FormattedDate } from '@/components/Shared/FormattedDate';

interface FlightOption { id: string; flight_no: string; departs_at: string; base_price: number; aircraft_type: string; }
interface SeatOption   { id: string; seat_number: string; class: 'economy' | 'business' | 'first'; extra_fee: number; }

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
    confirmed:   { bg: 'rgba(0,212,170,0.1)',    border: 'rgba(0,212,170,0.25)',    color: '#00d4aa',  label: 'Confirmed' },
    rescheduled: { bg: 'rgba(124,92,191,0.1)',   border: 'rgba(124,92,191,0.25)',   color: '#a78bfa',  label: 'Rescheduled' },
    cancelled:   { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)',    color: '#f87171',  label: 'Cancelled' },
  };
  const s = map[status] || map.confirmed;
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
}

/* ── Spinner ── */
function Spin({ size = 5 }: { size?: number }) {
  return (
    <div className={`w-${size} h-${size} rounded-full animate-spin shrink-0`}
      style={{ width: size * 4, height: size * 4, border: '2px solid rgba(245,166,35,0.1)', borderTop: '2px solid #f5a623' }} />
  );
}

export default function BookingsDashboard() {
  const router = useRouter();
  const { cachedBookings, setCachedBookings } = useUserStore();

  const [bookings, setBookings]       = useState<BookingCache[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isOffline, setIsOffline]     = useState(false);
  const [error, setError]             = useState('');

  const [cancelTarget, setCancelTarget]   = useState<BookingCache | null>(null);
  const [cancelling, setCancelling]       = useState(false);
  const [cancelError, setCancelError]     = useState('');

  const [rescheduleTarget, setRescheduleTarget]           = useState<BookingCache | null>(null);
  const [rescheduleFlights, setRescheduleFlights]         = useState<FlightOption[]>([]);
  const [selectedRescheduleFlight, setSelectedRescheduleFlight] = useState<FlightOption | null>(null);
  const [rescheduleSeats, setRescheduleSeats]             = useState<SeatOption[]>([]);
  const [selectedRescheduleSeat, setSelectedRescheduleSeat]   = useState<SeatOption | null>(null);
  const [rescheduling, setRescheduling]   = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [loadingFlights, setLoadingFlights]   = useState(false);
  const [loadingSeats, setLoadingSeats]       = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login?redirectTo=/bookings');
    });
    setIsOffline(!navigator.onLine);
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [router]);

  const fetchBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setLoading(true); setError('');

      if (navigator.onLine) {
        const { data, error: e } = await supabase.from('bookings').select(`
          id, flight_id, seat_id, status, booked_at, total_price, pnr_code,
          flight:flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price),
          seat:seats(seat_number, class, extra_fee),
          passengers(full_name, passport_no, nationality, dob)
        `).eq('user_id', session.user.id).order('booked_at', { ascending: false });
        if (e) throw e;
        setBookings(data as any);
        setCachedBookings(data as any);
      } else {
        setBookings(cachedBookings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings.');
      setBookings(cachedBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isWithinTwoHours = (d: string) => (new Date(d).getTime() - Date.now()) / 3_600_000 < 2;

  const executeCancel = async () => {
    if (!cancelTarget) return;
    if (isWithinTwoHours(cancelTarget.flight.departs_at)) {
      setCancelError('Cancellations within 2 hours of departure are not permitted.');
      return;
    }
    setCancelling(true); setCancelError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Unauthenticated');
      const { error: e } = await supabase.rpc('cancel_booking', {
        p_booking_id: cancelTarget.id, p_user_id: session.user.id,
      });
      if (e) throw e;
      setCancelTarget(null);
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Unable to cancel reservation.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReschedule = async (b: BookingCache) => {
    if (isWithinTwoHours(b.flight.departs_at)) { alert('Rescheduling within 2 hours of departure is prohibited.'); return; }
    setRescheduleTarget(b); setSelectedRescheduleFlight(null); setSelectedRescheduleSeat(null);
    setRescheduleFlights([]); setRescheduleSeats([]); setRescheduleError(''); setLoadingFlights(true);
    try {
      const { data, error: e } = await supabase.from('flights')
        .select('id, flight_no, departs_at, base_price, aircraft_type')
        .eq('origin', b.flight.origin).eq('destination', b.flight.destination)
        .neq('id', b.flight_id).gt('departs_at', new Date().toISOString())
        .order('departs_at', { ascending: true });
      if (e) throw e;
      setRescheduleFlights(data || []);
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to fetch flights.');
    } finally {
      setLoadingFlights(false);
    }
  };

  const handleRescheduleFlightChange = async (flightId: string) => {
    const f = rescheduleFlights.find(x => x.id === flightId);
    setSelectedRescheduleFlight(f || null); setSelectedRescheduleSeat(null); setRescheduleSeats([]);
    if (!flightId) return;
    setLoadingSeats(true);
    try {
      const { data, error: e } = await supabase.from('seats')
        .select('id, seat_number, class, extra_fee')
        .eq('flight_id', flightId).eq('is_available', true).order('seat_number', { ascending: true });
      if (e) throw e;
      setRescheduleSeats(data as any);
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to fetch seats.');
    } finally {
      setLoadingSeats(false);
    }
  };

  const executeReschedule = async () => {
    if (!rescheduleTarget || !selectedRescheduleFlight || !selectedRescheduleSeat) return;
    setRescheduling(true); setRescheduleError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Unauthenticated');
      const { error: e } = await supabase.rpc('reschedule_booking', {
        p_booking_id: rescheduleTarget.id,
        p_new_flight_id: selectedRescheduleFlight.id,
        p_new_seat_id: selectedRescheduleSeat.id,
        p_user_id: session.user.id,
      });
      if (e) throw e;
      setRescheduleTarget(null);
      fetchBookings();
    } catch (err: any) {
      setRescheduleError(err.message || 'Unable to reschedule.');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading && bookings.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
      <Spin size={6} />
      <p className="text-gray-600 text-sm">Loading your itineraries...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Ticket className="h-5 w-5" style={{ color: '#f5a623' }} /> My Bookings
          </h1>
          <p className="text-gray-600 text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={fetchBookings}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition hover:scale-105 active:scale-95"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.18)', color: '#f5a623' }}>
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Offline banner */}
      {isOffline && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.18)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: '#f5a623' }} />
          <p className="text-sm text-gray-400">Offline — showing cached bookings. Modifications unavailable.</p>
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-300 text-center"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl p-14 text-center"
          style={{ background: 'rgba(13,15,30,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-lg font-bold text-white mb-2">No bookings yet</h3>
          <p className="text-gray-600 text-sm mb-6">Book your first flight to see it here.</p>
          <button onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#07080f] btn-gold">
            <Search className="h-4 w-4" /> Search Flights
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const blocked = b.status === 'cancelled' || isOffline;
            const tooClose = isWithinTwoHours(b.flight.departs_at);

            return (
              <div key={b.id}
                className={`rounded-2xl overflow-hidden transition-all duration-200 ${b.status === 'cancelled' ? 'opacity-55' : ''}`}
                style={{ background: 'rgba(13,15,30,0.85)', border: `1px solid ${b.status === 'cancelled' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`, backdropFilter: 'blur(16px)' }}>

                {/* Top bar */}
                <div className="h-[2px]" style={{
                  background: b.status === 'confirmed' ? 'linear-gradient(90deg,#00d4aa,transparent)'
                    : b.status === 'rescheduled' ? 'linear-gradient(90deg,#a78bfa,transparent)'
                    : 'linear-gradient(90deg,rgba(255,255,255,0.06),transparent)',
                }} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="font-black text-white text-base">{b.flight.flight_no}</span>
                    <span className="text-gray-700 text-xs">·</span>
                    <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded text-gray-500"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {b.pnr_code}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Route grid */}
                  <div className="grid grid-cols-3 items-center gap-4 mb-4 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">From</div>
                      <div className="text-xl font-black text-white">{b.flight.origin}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        <FormattedDate isoString={b.flight.departs_at} options={{ month: 'short', day: 'numeric' }} />{' '}
                        <FormattedTime isoString={b.flight.departs_at} />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Plane className="h-4 w-4 opacity-30 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">To</div>
                      <div className="text-xl font-black text-white">{b.flight.destination}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        <FormattedDate isoString={b.flight.arrives_at} options={{ month: 'short', day: 'numeric' }} />{' '}
                        <FormattedTime isoString={b.flight.arrives_at} />
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        Seat <span className="font-bold capitalize" style={{ color: '#f5a623' }}>
                          {b.seat.seat_number} ({b.seat.class})
                        </span>
                      </span>
                      <span className="text-gray-600">
                        Paid <span className="font-bold text-white">${b.total_price}</span>
                      </span>
                    </div>

                    {!blocked && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenReschedule(b)} disabled={tooClose}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1d5db' }}>
                          <RefreshCw className="h-3 w-3" /> Reschedule
                        </button>
                        <button onClick={() => setCancelTarget(b)} disabled={tooClose}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                          <XCircle className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {rescheduleTarget && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(7,8,15,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(13,15,30,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,#7c5cbf,#f5a623)' }} />

            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-bold text-white flex items-center gap-2">
                <RefreshCw className="h-4 w-4" style={{ color: '#a78bfa' }} />
                Reschedule · {rescheduleTarget.flight.flight_no}
              </h3>
              <button onClick={() => setRescheduleTarget(null)} className="text-gray-600 hover:text-white text-xl transition">×</button>
            </div>

            <div className="p-6 space-y-4">
              {rescheduleError && (
                <div className="px-4 py-3 rounded-xl text-xs text-red-300"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                  {rescheduleError}
                </div>
              )}

              {loadingFlights ? (
                <div className="flex justify-center py-6"><Spin /></div>
              ) : rescheduleFlights.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">No alternative flights found on this route.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Select Flight</label>
                    <select onChange={e => handleRescheduleFlightChange(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <option value="" style={{ background: '#0d0f1e' }}>-- Choose alternate departure --</option>
                      {rescheduleFlights.map(f => (
                        <option key={f.id} value={f.id} style={{ background: '#0d0f1e' }}>
                          {f.flight_no} · {new Date(f.departs_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · ${f.base_price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRescheduleFlight && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center justify-between">
                        <span>Select Seat</span>
                        {loadingSeats && <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#f5a623' }} />}
                      </label>
                      <select onChange={e => { const s = rescheduleSeats.find(x => x.id === e.target.value); setSelectedRescheduleSeat(s || null); }}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <option value="" style={{ background: '#0d0f1e' }}>-- Choose seat --</option>
                        {rescheduleSeats.map(s => (
                          <option key={s.id} value={s.id} style={{ background: '#0d0f1e' }}>
                            {s.seat_number} · {s.class.toUpperCase()} {s.extra_fee > 0 ? `· +$${s.extra_fee}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedRescheduleFlight && selectedRescheduleSeat && (
                    <div className="rounded-xl p-4 space-y-2 text-xs"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex justify-between"><span className="text-gray-600">Current</span><span className="text-white">${rescheduleTarget.total_price}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">New Cost</span><span className="text-white">${Number(selectedRescheduleFlight.base_price) + Number(selectedRescheduleSeat.extra_fee)}</span></div>
                      <div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-gray-400">Change Fee</span>
                        <span style={{ color: '#f5a623' }}>
                          ${Math.max(0, Number(selectedRescheduleFlight.base_price) + Number(selectedRescheduleSeat.extra_fee) - Number(rescheduleTarget.total_price))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => setRescheduleTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-400 transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>Cancel</button>
              <button onClick={executeReschedule} disabled={!selectedRescheduleFlight || !selectedRescheduleSeat || rescheduling}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#07080f] btn-gold disabled:opacity-40 flex items-center justify-center gap-1.5">
                {rescheduling && <Loader2 className="h-3 w-3 animate-spin" />} Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelTarget && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(7,8,15,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(13,15,30,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,#f87171,transparent)' }} />

            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle className="h-7 w-7" style={{ color: '#f87171' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Cancel Booking?</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  This will permanently cancel flight{' '}
                  <span className="text-white font-semibold">{cancelTarget.flight.flight_no}</span>{' '}
                  and release seat{' '}
                  <span className="font-bold" style={{ color: '#f5a623' }}>{cancelTarget.seat.seat_number}</span>.
                </p>
              </div>
              {cancelError && (
                <div className="px-4 py-2.5 rounded-xl text-xs text-red-300"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                  {cancelError}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-400 transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>Keep</button>
              <button onClick={executeCancel} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {cancelling && <Loader2 className="h-3 w-3 animate-spin" />} Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
