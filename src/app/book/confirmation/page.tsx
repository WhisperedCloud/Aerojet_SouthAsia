'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle2, Plane, ArrowRight, Ticket } from 'lucide-react';
import { FormattedTime, FormattedDate } from '@/components/Shared/FormattedDate';

interface BookingDetails {
  id: string; pnr_code: string; total_price: number; booked_at: string;
  flight: { flight_no: string; origin: string; destination: string; departs_at: string; arrives_at: string; aircraft_type: string; };
  seat: { seat_number: string; class: string; };
  passengers: Array<{ full_name: string; nationality: string; }>;
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdsParam = searchParams.get('bookingIds');
  const bookingIds = bookingIdsParam ? bookingIdsParam.split(',') : [];
  const { resetStore } = useFlightStore();

  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');

  useEffect(() => {
    if (bookingIds.length === 0) { router.push('/'); return; }
    const fetch = async () => {
      try {
        const { data, error: e } = await supabase.from('bookings').select(`
          id, pnr_code, total_price, booked_at,
          flight:flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type),
          seat:seats(seat_number, class),
          passengers(full_name, nationality)
        `).in('id', bookingIds);
        if (e) throw e;
        setBookings(data as any[]);
        resetStore();
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookingIdsParam, router, resetStore]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
      <div className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '2px solid rgba(245,166,35,0.1)', borderTop: '2px solid #f5a623' }} />
      <p className="text-gray-600 text-sm">Generating your boarding pass...</p>
    </div>
  );

  if (error || bookings.length === 0) return (
    <div className="max-w-sm mx-auto my-16 text-center rounded-2xl p-8"
      style={{ background: 'rgba(13,15,30,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-bold text-white mb-2">Confirmation Error</h2>
      <p className="text-gray-500 text-sm mb-5">{error || 'Booking could not be located.'}</p>
      <button onClick={() => router.push('/')}
        className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#07080f] btn-gold">Return Home</button>
    </div>
  );

  const classBadgeColor: Record<string, string> = {
    first:    'rgba(245,166,35,0.12)',
    business: 'rgba(124,92,191,0.12)',
    economy:  'rgba(0,212,170,0.12)',
  };
  const classBadgeText: Record<string, string> = {
    first: '#f5a623', business: '#a78bfa', economy: '#00d4aa',
  };

  const mainBooking = bookings[0];
  const totalPrice = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">

      {/* Success hero */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute w-20 h-20 rounded-full animate-pulse-ring"
            style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)' }} />
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.3)' }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: '#00d4aa' }} />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 text-sm">Your seats are locked. Have a great flight. ✈️</p>
      </div>

      {/* Boarding pass card */}
      <div className="rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: 'rgba(13,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: '0.1s' }}>
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #00d4aa, #f5a623, #7c5cbf)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Status</div>
            <div className="text-xl font-bold" style={{ color: '#00d4aa' }}>
              CONFIRMED
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Total Charged</div>
            <div className="text-2xl font-black text-white">${totalPrice}</div>
          </div>
        </div>

        {/* Flight info */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>✈️</div>
            <div>
              <div className="font-bold text-white">{mainBooking.flight.flight_no}</div>
              <div className="text-xs text-gray-600">{mainBooking.flight.aircraft_type}</div>
            </div>
          </div>
        </div>

        {/* Route timeline */}
        <div className="grid grid-cols-3 items-center gap-4 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Depart</div>
            <div className="text-3xl font-black text-white">{mainBooking.flight.origin}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: '#f5a623' }}>
              <FormattedTime isoString={mainBooking.flight.departs_at} />
            </div>
            <div className="text-[10px] text-gray-600">
              <FormattedDate isoString={mainBooking.flight.departs_at} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-full h-[1px] relative" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#f5a623' }} />
            </div>
            <div className="text-[9px] text-gray-700 uppercase tracking-widest">Non-stop</div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Arrive</div>
            <div className="text-3xl font-black text-white">{mainBooking.flight.destination}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: '#00d4aa' }}>
              <FormattedTime isoString={mainBooking.flight.arrives_at} />
            </div>
            <div className="text-[10px] text-gray-600">
              <FormattedDate isoString={mainBooking.flight.arrives_at} />
            </div>
          </div>
        </div>

        {/* Passengers row */}
        <div className="px-6 py-4 space-y-3">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Passengers & Seats</div>
          {bookings.map((b, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 rounded-xl gap-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="font-bold text-white text-sm uppercase tracking-wide">{b.passengers[0]?.full_name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">PNR: <span className="font-mono text-[#f5a623]">{b.pnr_code}</span></div>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                 <span className="text-base font-black text-white">{b.seat.seat_number}</span>
                 <span className="text-[9px] px-2 py-0.5 rounded font-bold capitalize"
                   style={{
                     background: classBadgeColor[b.seat.class] || 'rgba(255,255,255,0.05)',
                     color: classBadgeText[b.seat.class] || '#9ca3af',
                   }}>
                   {b.seat.class}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button onClick={() => router.push('/bookings')}
          className="py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Ticket className="h-4 w-4" style={{ color: '#f5a623' }} /> My Bookings
        </button>
        <button onClick={() => router.push('/')}
          className="py-3.5 px-4 rounded-xl text-sm font-bold text-[#07080f] btn-gold flex items-center justify-center gap-2">
          New Search <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[55vh]">
        <div className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '2px solid rgba(245,166,35,0.1)', borderTop: '2px solid #f5a623' }} />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
