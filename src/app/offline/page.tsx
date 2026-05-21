'use client';

import Link from 'next/link';
import { WifiOff, Ticket, RefreshCw } from 'lucide-react';

export default function OfflineFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto my-12 text-center bg-slate-900 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500" />
      
      <WifiOff className="h-16 w-16 text-red-400 mx-auto mb-4 animate-pulse" />
      <h2 className="text-2xl font-bold text-white font-heading mb-2">No Internet Connection</h2>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        AeroJet is currently unable to communicate with our reservation servers. You can still access and view your active flight itineraries from your local cache.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/bookings"
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
        >
          <Ticket className="h-4 w-4" /> View My Cached Bookings
        </Link>
        <button
          onClick={handleReload}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 rounded-xl text-sm font-semibold transition"
        >
          <RefreshCw className="h-4 w-4" /> Try Reconnecting
        </button>
      </div>
    </div>
  );
}
