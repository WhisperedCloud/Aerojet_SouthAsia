'use client';

import { useEffect, useState } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Connection restored', {
        description: 'You are back online.',
        icon: '🟢',
      });
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('You are offline', {
        description: 'Showing cached data.',
        icon: '🔴',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-950 border-b border-red-500/30 text-red-200 px-4 py-2 text-center text-sm flex items-center justify-center gap-2 animate-pulse sticky top-0 z-50">
      <WifiOff className="h-4 w-4" />
      <span className="font-medium">You are currently offline.</span>
      <span className="text-red-400 text-xs hidden sm:inline flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 inline" />
        Showing last-cached flight search results and booking history.
      </span>
    </div>
  );
}
