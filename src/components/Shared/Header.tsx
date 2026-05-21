'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useFlightStore } from '@/store/useFlightStore';
import { supabase } from '@/lib/supabaseClient';
import { Plane, LogIn, LogOut, Ticket, Menu, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSessionToken, resetUser } = useUserStore();
  const { resetStore } = useFlightStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setSessionToken(session?.access_token || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setSessionToken(session?.access_token || null);
      if (event === 'SIGNED_OUT') { resetUser(); resetStore(); }
    });

    return () => subscription.unsubscribe();
  }, [setSessionToken, resetUser, resetStore]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetUser(); resetStore();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(7,8,15,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Back Button */}
          {pathname !== '/' && (
            <button onClick={() => router.back()} className="flex text-gray-400 hover:text-white items-center gap-1.5 text-sm font-medium transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {/* Logo */}
          <a href="/" onClick={() => { resetStore(); if (typeof window !== 'undefined') sessionStorage.removeItem('aj_launched'); }} className="flex items-center gap-2.5 hover:opacity-90 transition group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, #f5a623 0%, #e8810a 100%)', boxShadow: '0 4px 15px rgba(245,166,35,0.35)' }}>
              <Plane className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-gold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              AeroJet
            </span>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6 relative h-full">
          <Link href="/" className={`relative text-sm font-medium transition-colors h-16 flex items-center ${(pathname === '/' || pathname.startsWith('/flights') || pathname.startsWith('/book')) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            Search Flights
            {(pathname === '/' || pathname.startsWith('/flights') || pathname.startsWith('/book')) && (
              <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #f5a623, #00d4aa)' }} />
            )}
          </Link>
          {isAuthenticated && (
            <Link href="/bookings" className={`relative text-sm font-medium transition-colors h-16 flex items-center gap-1.5 ${pathname.startsWith('/bookings') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              <Ticket className="h-4 w-4" /> My Bookings
              {pathname.startsWith('/bookings') && (
                <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #f5a623, #00d4aa)' }} />
              )}
            </Link>
          )}
          <div className="flex items-center h-16">
            <NotificationBell />
          </div>
          {isAuthenticated ? (
            <button onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-red-400 transition flex items-center gap-1.5">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <Link href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#07080f] btn-gold">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="sm:hidden text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/5 px-4 py-4 space-y-3" style={{ background: 'rgba(13,15,30,0.98)' }}>
          <Link href="/" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-300 hover:text-white">Search Flights</Link>
          {isAuthenticated && (
            <Link href="/bookings" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-300 hover:text-white">My Bookings</Link>
          )}
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-sm text-red-400">Logout</button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#07080f] btn-gold">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
