'use client';

import { motion } from 'framer-motion';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationItem from './NotificationItem';
import { Check, Trash2, X, Bell } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, markAllAsRead, clearAll } = useNotificationStore();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 flex flex-col"
      style={{ maxHeight: '80vh', background: 'rgba(13,15,30,0.95)', right: '-16px' }}
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="font-bold text-white">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button onClick={markAllAsRead} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition" title="Mark all as read">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={clearAll} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Clear all">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white sm:hidden rounded-lg transition">
             <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto p-2 space-y-1 flex-grow custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => (
            <NotificationItem key={notif.id} notification={notif} />
          ))
        )}
      </div>
    </motion.div>
  );
}
