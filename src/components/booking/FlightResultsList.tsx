'use client';

import { useFlightStore } from '@/store/useFlightStore';
import { useRouter } from 'next/navigation';
import { Plane, Clock, ChevronRight, Star, Wifi, Coffee, Zap } from 'lucide-react';
import { FormattedTime } from '@/components/Shared/FormattedDate';

interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: string;
  base_price: number;
}

interface FlightResultsListProps {
  flights: Flight[];
}

const CLASS_BADGES = ['Economy', 'Business', 'First'];

const AIRCRAFT_ICONS: Record<string, string> = {
  'Boeing 777': '🛫',
  'Boeing 737': '✈️',
  'Boeing 787': '🛩️',
  'Airbus A320': '🛬',
  'Airbus A321': '🛬',
  'Airbus A350': '✈️',
};

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delayed':   return 'badge-delayed';
    case 'cancelled': return 'badge-cancelled';
    case 'boarding':  return 'badge-boarding';
    default:          return 'badge-on-time';
  }
};

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delayed':   return 'Delayed';
    case 'cancelled': return 'Cancelled';
    case 'boarding':  return 'Now Boarding';
    default:          return 'On Time';
  }
};

const getPriceColor = (price: number) => {
  if (price < 180) return '#00d4aa';  // teal — cheap
  if (price < 300) return '#f5a623';  // gold — mid
  return '#f06292';                   // rose — premium
};

export default function FlightResultsList({ flights }: FlightResultsListProps) {
  const router = useRouter();
  const { selectFlight } = useFlightStore();

  const handleSelectFlight = (flightId: string) => {
    selectFlight(flightId);
    router.push(`/book/seats`);
  };

  const calculateDuration = (dep: string, arr: string) => {
    const diff = new Date(arr).getTime() - new Date(dep).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  if (flights.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(13,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>✈️</div>
        <h3 className="text-lg font-bold text-white mb-2">No Flights Found</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          No AeroJet departures matched your search path. Try a different date or route.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight, idx) => {
        const duration = calculateDuration(flight.departs_at, flight.arrives_at);
        const priceColor = getPriceColor(flight.base_price);
        const aircraftEmoji = AIRCRAFT_ICONS[flight.aircraft_type] || '✈️';

        return (
          <div key={flight.id}
            className="flight-card rounded-2xl overflow-hidden animate-slide-up"
            style={{ animationDelay: `${idx * 0.06}s` }}>

            {/* Top stripe for pricing tier */}
            <div className="h-[2px] w-full"
              style={{ background: `linear-gradient(90deg, ${priceColor}60, transparent)` }} />

            <div className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                {/* Left: Airline info */}
                <div className="flex items-center gap-3 lg:w-44 shrink-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.12)' }}>
                    {aircraftEmoji}
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">{flight.flight_no}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{flight.aircraft_type}</div>
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1 ${getStatusStyle(flight.status)}`}>
                      {getStatusText(flight.status)}
                    </div>
                  </div>
                </div>

                {/* Center: Route timeline */}
                <div className="flex-grow flex items-center gap-4">
                  {/* Depart */}
                  <div className="text-left">
                    <div className="text-2xl font-black text-white tabular-nums">
                      <FormattedTime isoString={flight.departs_at} />
                    </div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: '#f5a623' }}>{flight.origin}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wide">Depart</div>
                  </div>

                  {/* Timeline bar */}
                  <div className="flex-grow flex flex-col items-center gap-1 min-w-[80px]">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {duration}
                    </div>
                    <div className="relative w-full h-[1px]" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: '#f5a623' }} />
                      <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3" style={{ color: '#f5a623' }} />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: '#00d4aa' }} />
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#00d4aa' }}>Non-stop</div>
                  </div>

                  {/* Arrive */}
                  <div className="text-right">
                    <div className="text-2xl font-black text-white tabular-nums">
                      <FormattedTime isoString={flight.arrives_at} />
                    </div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: '#00d4aa' }}>{flight.destination}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wide">Arrive</div>
                  </div>
                </div>

                {/* Cabin badges */}
                <div className="hidden xl:flex flex-col gap-1.5 shrink-0">
                  {CLASS_BADGES.map(cls => (
                    <div key={cls} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg text-gray-400"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {cls}
                    </div>
                  ))}
                </div>

                {/* Amenity icons */}
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                  {[Wifi, Coffee, Zap].map((Icon, i) => (
                    <div key={i} className="w-7 h-7 flex items-center justify-center rounded-lg" title={['Wi-Fi', 'Meals', 'USB Charging'][i]}
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  ))}
                </div>

                {/* Right: Price + CTA */}
                <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">From</div>
                    <div className="text-3xl font-black tabular-nums" style={{ color: priceColor }}>
                      ${flight.base_price}
                    </div>
                    <div className="text-[10px] text-gray-600">per person</div>
                  </div>
                  <button onClick={() => handleSelectFlight(flight.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#07080f] btn-gold shrink-0">
                    Select Seat <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Bottom amenities on mobile */}
              <div className="mt-4 pt-4 flex items-center justify-between lg:hidden"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex gap-2">
                  {[Wifi, Coffee, Zap].map((Icon, i) => (
                    <div key={i} className="w-6 h-6 flex items-center justify-center rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                      <Icon className="h-3 w-3" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {CLASS_BADGES.map(cls => (
                    <div key={cls} className="text-[9px] font-semibold px-2 py-0.5 rounded text-gray-500"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>{cls}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
