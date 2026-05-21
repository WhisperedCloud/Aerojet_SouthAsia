'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore, PassengerDetails } from '@/store/useFlightStore';
import { useUserStore } from '@/store/useUserStore';
import { useNotificationStore } from '@/store/notificationStore';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, User, Globe, Calendar, ShieldCheck, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { sendPushNotification } from '@/lib/notifications/pushNotifications';

function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full animate-spin shrink-0"
      style={{ border: '2px solid rgba(245,166,35,0.15)', borderTop: '2px solid #f5a623' }} />
  );
}

export default function PassengerPage() {
  const router = useRouter();
  const { selectedFlightId, selectedSeatIds, setPassengerDetails } = useFlightStore();
  const { setCachedBookings } = useUserStore();
  const { addNotification } = useNotificationStore();

  const [passengers, setPassengers] = useState<PassengerDetails[]>([]);
  const [loading, setLoading]     = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [userId, setUserId]       = useState<string | null>(null);
  
  const [flightInfo, setFlightInfo] = useState<any>(null);
  const [seatsInfo, setSeatsInfo]   = useState<any[]>([]);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!selectedFlightId || !selectedSeatIds || selectedSeatIds.length === 0) { router.push('/'); return; }

    // Initialize passenger array
    setPassengers(selectedSeatIds.map(() => ({ fullName: '', passportNo: '', nationality: '', dob: '' })));

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push(`/login?redirectTo=/book/passenger`); return; }
        setUserId(session.user.id);

        const [{ data: flight }, { data: seats }] = await Promise.all([
          supabase.from('flights').select('base_price, flight_no, origin, destination').eq('id', selectedFlightId).single(),
          supabase.from('seats').select('id, extra_fee, seat_number, class').in('id', selectedSeatIds),
        ]);

        if (flight && seats) {
          setFlightInfo(flight);
          setSeatsInfo(seats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAuthChecking(false);
      }
    };

    init();
  }, [selectedFlightId, selectedSeatIds, router]);

  const generatePNR = () => {
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join('');
  };

  const handleUpdatePassenger = (index: number, field: keyof PassengerDetails, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedFlightId || selectedSeatIds.length === 0 || !flightInfo) return;
    setError(''); setLoading(true);

    try {
      const bookingIds: string[] = [];
      const pnrs: string[] = [];

      for (let i = 0; i < selectedSeatIds.length; i++) {
        const seatId = selectedSeatIds[i];
        const passenger = passengers[i];
        const seatInfo = seatsInfo.find(s => s.id === seatId);
        
        const pnrCode = generatePNR();
        const totalPrice = Number(flightInfo.base_price) + Number(seatInfo?.extra_fee || 0);

        const { data, error: rpcErr } = await supabase.rpc('book_flight', {
          p_user_id: userId, p_flight_id: selectedFlightId, p_seat_id: seatId,
          p_passenger_name: passenger.fullName, p_passport_no: passenger.passportNo,
          p_nationality: passenger.nationality, p_dob: passenger.dob,
          p_total_price: totalPrice, p_pnr_code: pnrCode,
        });
        
        if (rpcErr) throw rpcErr;
        
        const bId = (Array.isArray(data) ? data[0] : data).booking_id;
        bookingIds.push(bId);
        pnrs.push(pnrCode);
      }

      setPassengerDetails(passengers);

      const { data: userBookings } = await supabase.from('bookings').select(`
        id, flight_id, seat_id, status, booked_at, total_price, pnr_code,
        flight:flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price),
        seat:seats(seat_number, class, extra_fee),
        passengers(full_name, passport_no, nationality, dob)
      `).eq('user_id', userId);

      if (userBookings) setCachedBookings(userBookings as any);

      const notificationMsg = `Successfully booked ${selectedSeatIds.length} seat(s) for flight ${flightInfo.flight_no}.`;
      
      addNotification({
        type: 'booking',
        title: 'Booking Confirmed!',
        message: notificationMsg,
      });
      
      toast.success('Booking Confirmed!', {
        description: notificationMsg,
      });

      sendPushNotification('Booking Confirmed!', {
        body: notificationMsg,
      });

      router.push(`/book/confirmation?bookingIds=${bookingIds.join(',')}`);
    } catch (err: any) {
      setError(err.message || 'Seat reservation failed. Some seats may already be taken.');
      toast.error('Booking Failed', {
        description: err.message || 'Could not complete booking.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Spinner />
      <p className="text-gray-600 text-sm">Verifying session...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <button onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-400 transition font-medium">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Seat Map
      </button>

      {/* Flight context banner */}
      {flightInfo && seatsInfo.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 rounded-2xl gap-4"
          style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.14)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>✈️</div>
            <div>
              <div className="text-sm font-bold text-white">{flightInfo.flight_no}</div>
              <div className="text-xs text-gray-500">{flightInfo.origin} → {flightInfo.destination}</div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs text-gray-600 uppercase tracking-wide">Selected Seats ({seatsInfo.length})</div>
            <div className="text-sm font-bold capitalize flex flex-wrap gap-2 sm:justify-end mt-1" style={{ color: '#f5a623' }}>
              {seatsInfo.map(s => (
                 <span key={s.id} className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{s.seat_number} · {s.class}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Traveler Details
        </h1>
        <p className="text-gray-600 text-sm mt-1">Enter details exactly as on your passport for all passengers.</p>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(13,15,30,0.85)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,#f5a623,#00d4aa)' }} />

        <div className="p-6 sm:p-8">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5' }}>
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {selectedSeatIds.map((seatId, index) => {
              const seat = seatsInfo.find(s => s.id === seatId);
              const passenger = passengers[index];
              if (!passenger) return null;
              
              return (
                <div key={seatId} className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
                     <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-400" /> Passenger {index + 1}
                     </h3>
                     <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                        Seat: {seat?.seat_number} ({seat?.class})
                     </span>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" style={{ color: '#f5a623' }} /> Full Name
                    </label>
                    <input type="text" required value={passenger.fullName} onChange={e => handleUpdatePassenger(index, 'fullName', e.target.value)}
                      placeholder="As it appears on passport"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 uppercase focus:outline-none transition"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>

                  {/* Passport */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" style={{ color: '#f5a623' }} /> Passport Number
                      </span>
                    </label>
                    <input type="text" required value={passenger.passportNo} onChange={e => handleUpdatePassenger(index, 'passportNo', e.target.value.toUpperCase())}
                      placeholder="A12345678"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 uppercase focus:outline-none transition"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>

                  {/* Nationality + DOB */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="h-3 w-3" style={{ color: '#00d4aa' }} /> Nationality
                      </label>
                      <input type="text" required value={passenger.nationality} onChange={e => handleUpdatePassenger(index, 'nationality', e.target.value)}
                        placeholder="India"
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3" style={{ color: '#00d4aa' }} /> Date of Birth
                      </label>
                      <input type="date" required value={passenger.dob} max={new Date().toISOString().split('T')[0]}
                        onChange={e => handleUpdatePassenger(index, 'dob', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Price summary */}
            {flightInfo && seatsInfo.length > 0 && (
              <div className="rounded-xl p-4 mt-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Price Summary</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Fare ({seatsInfo.length}x)</span>
                    <span className="text-white">${Number(flightInfo.base_price) * seatsInfo.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Seat Fees</span>
                    <span className="text-white">${seatsInfo.reduce((acc, s) => acc + Number(s.extra_fee), 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 font-bold text-base"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-white">Total</span>
                    <span style={{ color: '#f5a623' }}>${(Number(flightInfo.base_price) * seatsInfo.length) + seatsInfo.reduce((acc, s) => acc + Number(s.extra_fee), 0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm text-[#07080f] btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? <><Spinner /> Reserving seats...</> : <><Plane className="h-4 w-4" /> Confirm Booking &amp; Issue PNRs</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
