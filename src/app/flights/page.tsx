import { createClient } from '@/lib/supabaseServer';
import FlightResultsList from '@/components/booking/FlightResultsList';
import Link from 'next/link';
import { Plane, ArrowRight, Calendar, Users, Search } from 'lucide-react';

interface SearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: string;
}

export const revalidate = 0;

export default async function FlightsPage({ searchParams }: { searchParams: SearchParams }) {
  const { origin, destination, date, passengers } = searchParams;

  if (!origin || !destination || !date) {
    return (
      <div className="max-w-md mx-auto my-16 text-center rounded-2xl p-8"
        style={{ background: 'rgba(13,15,30,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-4xl mb-4">🛫</div>
        <h2 className="text-xl font-bold text-white mb-2">Missing Search Parameters</h2>
        <p className="text-gray-500 text-sm mb-6">Please return to the search dashboard and re-enter flight criteria.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#07080f] btn-gold">
          <Search className="h-4 w-4" /> Back to Search
        </Link>
      </div>
    );
  }

  const supabase = createClient();

  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data: flights, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departs_at', startOfDay)
    .lte('departs_at', endOfDay)
    .order('departs_at', { ascending: true });

  const passengersCount = parseInt(passengers || '1', 10);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Page header */}
      <div className="mb-8 animate-slide-up">
        {/* Route breadcrumb */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4 text-sm font-bold"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <span style={{ color: '#f5a623' }}>{origin}</span>
          <ArrowRight className="h-3.5 w-3.5 text-gray-600" />
          <span style={{ color: '#00d4aa' }}>{destination}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Select Your Flight
            </h1>
            <p className="text-gray-500 text-sm">
              Showing departures from <span className="text-white font-semibold">{origin}</span> to{' '}
              <span className="text-white font-semibold">{destination}</span>
            </p>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Calendar className="h-3.5 w-3.5" /> {date}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Users className="h-3.5 w-3.5" /> {passengersCount} Passenger{passengersCount > 1 ? 's' : ''}
            </div>
            {flights && flights.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#f5a623' }}>
                <Plane className="h-3.5 w-3.5" /> {flights.length} Flight{flights.length !== 1 ? 's' : ''} Found
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-5 h-[1px]" style={{ background: 'linear-gradient(90deg, rgba(245,166,35,0.3), transparent)' }} />
      </div>

      {/* Modify search strip */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-gray-600">Prices shown are base fares per person. Seat class fees apply at checkout.</p>
        <Link href="/" className="text-xs font-medium flex items-center gap-1 transition hover:opacity-80" style={{ color: '#f5a623' }}>
          <Search className="h-3 w-3" /> Modify Search
        </Link>
      </div>

      {/* Results */}
      {error ? (
        <div className="text-red-300 text-center p-6 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="font-semibold">Unable to fetch flights</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
        </div>
      ) : (
        <FlightResultsList flights={flights || []} />
      )}
    </div>
  );
}
