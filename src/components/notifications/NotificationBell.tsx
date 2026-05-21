'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotificationStore(state => state.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <Bell className="h-5 w-5" />
        {mounted && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#07080f]" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <NotificationPanel onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
