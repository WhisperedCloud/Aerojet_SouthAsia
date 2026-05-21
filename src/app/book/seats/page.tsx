'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { supabase } from '@/lib/supabaseClient';
import SeatMap from '../../../components/booking/SeatMap';
import { Plane, ArrowLeft, Loader2 } from 'lucide-react';

interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: 'economy' | 'business' | 'first';
  is_available: boolean;
  extra_fee: number;
}

interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  base_price: number;
}

export default function SeatingPage() {
  const router = useRouter();
  const { selectedFlightId, resetStore } = useFlightStore();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFlightId) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch flight info
        const { data: flightData, error: flightErr } = await supabase
          .from('flights')
          .select('*')
          .eq('id', selectedFlightId)
          .single();

        if (flightErr) throw flightErr;
        setFlight(flightData);

        // Fetch seat list
        const { data: seatsData, error: seatsErr } = await supabase
          .from('seats')
          .select('*')
          .eq('flight_id', selectedFlightId);

        if (seatsErr) throw seatsErr;
        
        // Sort seats numerically/alphabetically
        const sorted = (seatsData || []).sort((a, b) => {
          const numA = parseInt(a.seat_number);
          const numB = parseInt(b.seat_number);
          if (numA !== numB) return numA - numB;
          return a.seat_number.localeCompare(b.seat_number);
        });
        
        setSeats(sorted);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch seating arrangements.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to Realtime update channel for seats on this flight
    const channel = supabase
      .channel(`flight-seats-${selectedFlightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${selectedFlightId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as Seat;
          setSeats((currentSeats) =>
            currentSeats.map((s) => (s.id === updatedSeat.id ? updatedSeat : s))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedFlightId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading cabin layouts...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="max-w-md mx-auto my-12 text-center bg-slate-900 border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Seating Map</h2>
        <p className="text-slate-400 text-sm mb-4">{error || 'Flight not found.'}</p>
        <button
          onClick={() => {
            resetStore();
            router.push('/');
          }}
          className="px-4 py-2 bg-indigo-600 rounded-lg text-sm text-white font-medium hover:bg-indigo-500 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to flight selection
      </button>

      <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Select Your Cabin Seat</h1>
          <p className="text-slate-400 text-sm mt-1">
            Flight <span className="text-white font-semibold">{flight.flight_no}</span> · Base price{' '}
            <span className="text-indigo-400 font-bold">${flight.base_price}</span>
          </p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 flex items-center gap-1.5">
          <Plane className="h-4 w-4 text-indigo-400" />
          Live synchronization active
        </div>
      </div>

      <SeatMap flight={flight} initialSeats={seats} onSelect={(seatIds) => useFlightStore.getState().setBookingStep('passenger')} />
    </div>
  );
}
