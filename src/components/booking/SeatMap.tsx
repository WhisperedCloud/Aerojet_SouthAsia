'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { Check, Info, ShieldAlert } from 'lucide-react';

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

interface SeatMapProps {
  flight: Flight;
  initialSeats: Seat[];
  onSelect: (seatIds: string[]) => void;
}

export default function SeatMap({ flight, initialSeats, onSelect }: SeatMapProps) {
  const router = useRouter();
  const { selectedSeatIds, optimisticSeatIds, setOptimisticSeatIds, toggleSeat, searchQuery } = useFlightStore();
  const maxSeats = searchQuery?.passengers || 1;
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(() => {
    if (selectedSeatIds.length > 0) {
      return initialSeats.filter((s) => selectedSeatIds.includes(s.id));
    }
    return [];
  });

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return;

    // Toggle logic
    let newSelectedSeats = [...selectedSeats];
    const isSelected = newSelectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      newSelectedSeats = newSelectedSeats.filter(s => s.id !== seat.id);
    } else {
      if (newSelectedSeats.length >= maxSeats) return;
      newSelectedSeats.push(seat);
    }
    
    // Optimistic UI updates
    setOptimisticSeatIds(newSelectedSeats.map(s => s.id));
    setSelectedSeats(newSelectedSeats);
    toggleSeat(seat.id, maxSeats);
  };

  const handleConfirm = () => {
    if (selectedSeats.length !== maxSeats) return;
    onSelect(selectedSeats.map(s => s.id));
    router.push('/book/passenger');
  };

  // Group seats by row
  const rows: { [key: number]: Seat[] } = {};
  initialSeats.forEach((seat) => {
    const rowNum = parseInt(seat.seat_number);
    if (!rows[rowNum]) rows[rowNum] = [];
    rows[rowNum].push(seat);
  });

  // Sort seats in each row by column letter (e.g. A, B, C, D, E, F)
  Object.keys(rows).forEach((rowNum) => {
    rows[parseInt(rowNum)].sort((a, b) => a.seat_number.slice(-1).localeCompare(b.seat_number.slice(-1)));
  });

  const getSeatClassColor = (seatClass: 'first' | 'business' | 'economy', isSelected: boolean) => {
    if (isSelected) return 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30';
    switch (seatClass) {
      case 'first':
        return 'bg-amber-600/20 border-amber-500/40 hover:bg-amber-500/30 text-amber-300';
      case 'business':
        return 'bg-purple-600/20 border-purple-500/40 hover:bg-purple-500/30 text-purple-300';
      case 'economy':
        return 'bg-sky-600/20 border-sky-500/40 hover:bg-sky-500/30 text-sky-300';
    }
  };

  const renderSeatRow = (rowNum: number, seatsInRow: Seat[]) => {
    const isFirstClass = rowNum <= 3;
    const isBusinessClass = rowNum >= 4 && rowNum <= 8;
    const isEconomyClass = rowNum >= 9;

    let colsOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
    if (isFirstClass) {
      colsOrder = ['A', 'B', 'C', 'D']; // 1-2-1 configuration
    }

    return (
      <div key={rowNum} className="flex items-center justify-center gap-2 sm:gap-3 py-1">
        {/* Row Number */}
        <div className="w-6 text-center text-xs text-slate-500 font-bold shrink-0">{rowNum}</div>

        {/* Seats and Aisles */}
        <div className="flex items-center gap-2">
          {colsOrder.map((col, idx) => {
            const seat = seatsInRow.find((s) => s.seat_number.endsWith(col));
            const isAisle = isFirstClass ? idx === 1 || idx === 3 : isBusinessClass ? idx === 2 || idx === 4 : idx === 3;

            // Render spacing for Aisle
            const aisleElement = isAisle && idx !== colsOrder.length - 1 ? (
              <div key={`aisle-${rowNum}-${idx}`} className="w-4 sm:w-6 shrink-0" />
            ) : null;

            if (!seat) {
              return (
                <div key={`empty-${rowNum}-${col}`} className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-transparent border border-transparent" />
                  {aisleElement}
                </div>
              );
            }

            const isCurrentSelected = selectedSeats.some(s => s.id === seat.id) || optimisticSeatIds.includes(seat.id);
            const isSeatOccupied = !seat.is_available;

            const baseStyle = "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs border transition-all duration-150 cursor-pointer select-none tooltip-container";
            const currentStyle = isSeatOccupied
              ? "bg-slate-800/80 border-slate-700/50 text-slate-600 cursor-not-allowed opacity-50"
              : getSeatClassColor(seat.class, isCurrentSelected);

            return (
              <div key={seat.id} className="flex items-center">
                <button
                  type="button"
                  disabled={isSeatOccupied}
                  onClick={() => handleSeatClick(seat)}
                  className={`${baseStyle} ${currentStyle}`}
                >
                  {isCurrentSelected ? <Check className="h-3.5 w-3.5 text-white" /> : seat.seat_number.slice(-1)}

                  {/* Tooltip on Hover */}
                  <span className="tooltip-text bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-200 font-semibold shadow-xl w-32 whitespace-normal leading-tight text-center">
                    {isSeatOccupied ? (
                      <span className="text-red-400">Occupied Seat</span>
                    ) : (
                      <>
                        <span className="uppercase text-indigo-400 font-bold block">{seat.class} Class</span>
                        <span className="text-slate-300 block font-normal mt-0.5">
                          {seat.extra_fee > 0 ? `+$${seat.extra_fee} Extra Fee` : 'No Extra Fee'}
                        </span>
                      </>
                    )}
                  </span>
                </button>
                {aisleElement}
              </div>
            );
          })}
        </div>

        {/* Row Number Right */}
        <div className="w-6 text-center text-xs text-slate-500 font-bold shrink-0">{rowNum}</div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Seat Selection Panel */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col items-center">
        {/* Cockpit Nose */}
        <div className="w-36 h-12 bg-slate-800 rounded-t-full border-t border-x border-slate-700/50 flex items-center justify-center mb-6 relative shadow-lg shadow-slate-950/20">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Cockpit
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-slate-700" />
        </div>

        {/* Seating Map Container (Scrollable on Mobile) */}
        <div className="w-full overflow-x-auto no-scrollbar pb-6 flex justify-center">
          <div className="min-w-[280px] px-2 flex flex-col gap-1">
            {/* Zone Labels */}
            <div className="flex flex-col gap-4">
              {/* First Class Zone */}
              <div className="border border-amber-500/10 bg-amber-500/[0.02] p-2 rounded-xl">
                <div className="text-[10px] text-center font-bold uppercase tracking-wider text-amber-500 mb-2">
                  First Class Zone (Rows 1-3)
                </div>
                {[1, 2, 3].map((rowNum) => rows[rowNum] && renderSeatRow(rowNum, rows[rowNum]))}
              </div>

              {/* Business Class Zone */}
              <div className="border border-purple-500/10 bg-purple-500/[0.02] p-2 rounded-xl">
                <div className="text-[10px] text-center font-bold uppercase tracking-wider text-purple-500 mb-2">
                  Business Class Zone (Rows 4-8)
                </div>
                {[4, 5, 6, 7, 8].map((rowNum) => rows[rowNum] && renderSeatRow(rowNum, rows[rowNum]))}
              </div>

              {/* Economy Class Zone */}
              <div className="border border-sky-500/10 bg-sky-500/[0.02] p-2 rounded-xl">
                <div className="text-[10px] text-center font-bold uppercase tracking-wider text-sky-500 mb-2">
                  Economy Class Zone (Rows 9-20)
                </div>
                {Array.from({ length: 12 }, (_, i) => i + 9).map((rowNum) => rows[rowNum] && renderSeatRow(rowNum, rows[rowNum]))}
              </div>
            </div>
          </div>
        </div>

        {/* Exit Tail */}
        <div className="w-24 h-6 bg-slate-800 rounded-b-xl border-b border-x border-slate-700/50 mt-4" />
      </div>

      {/* Cart Summary Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
        <h3 className="font-heading font-bold text-lg text-white">Selection Details</h3>

        {/* Legend */}
        <div className="space-y-2 border-b border-white/5 pb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Legend</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" /> First Class
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/40" /> Business Class
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-4 h-4 rounded bg-sky-500/20 border border-sky-500/40" /> Economy Class
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-4 h-4 rounded bg-indigo-500 border border-indigo-400" /> Selected
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 col-span-2">
              <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700 opacity-50" /> Occupied / Unavailable
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Base Flight Ticket:</span>
            <span className="font-semibold text-white">${flight.base_price}</span>
          </div>

          {selectedSeats.length > 0 && (
            <div className="flex flex-col gap-2 bg-slate-900/60 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
              <span className="text-slate-400 text-xs uppercase font-bold tracking-wide block">Selected Seats ({selectedSeats.length}/{maxSeats})</span>
              {selectedSeats.map(seat => (
                <div key={seat.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-indigo-400 text-sm">{seat.seat_number}</span>
                    <span className="text-slate-400 text-[10px] ml-1.5 capitalize">({seat.class} Class)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-sm">${seat.extra_fee}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/5 pt-4 flex justify-between items-baseline">
            <span className="text-base font-bold text-white">Total Amount:</span>
            <span className="text-2xl font-black text-indigo-400">
              ${Number(flight.base_price) * maxSeats + selectedSeats.reduce((sum, seat) => sum + Number(seat.extra_fee), 0)}
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={selectedSeats.length !== maxSeats}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] text-white rounded-xl font-semibold transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 text-sm"
        >
          Confirm Seating & Continue
        </button>
      </div>
    </div>
  );
}
