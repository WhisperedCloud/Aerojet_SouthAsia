'use client';

import { AppNotification, useNotificationStore } from '@/store/notificationStore';
import { Plane, AlertTriangle, CreditCard, Info, Clock } from 'lucide-react';
import { FormattedTime, FormattedDate } from '../Shared/FormattedDate';

interface Props {
  notification: AppNotification;
}

export default function NotificationItem({ notification }: Props) {
  const markAsRead = useNotificationStore(state => state.markAsRead);
  
  const getIcon = () => {
    switch (notification.type) {
      case 'booking': return <Plane className="w-4 h-4 text-emerald-400" />;
      case 'flight': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'reminder': return <Clock className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getBg = () => {
    switch (notification.type) {
      case 'booking': return 'bg-emerald-400/10 border-emerald-400/20';
      case 'flight': return 'bg-amber-400/10 border-amber-400/20';
      case 'payment': return 'bg-blue-400/10 border-blue-400/20';
      case 'reminder': return 'bg-purple-400/10 border-purple-400/20';
      default: return 'bg-sky-400/10 border-sky-400/20';
    }
  };

  return (
    <div 
      onClick={() => !notification.read && markAsRead(notification.id)}
      className={`p-3 rounded-xl cursor-pointer transition flex gap-3 group border ${notification.read ? 'bg-transparent border-transparent opacity-70 hover:bg-white/5' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${getBg()}`}>
        {getIcon()}
      </div>
      <div className="flex-grow">
        <h4 className={`text-sm font-semibold mb-0.5 ${notification.read ? 'text-gray-300' : 'text-white'}`}>
          {notification.title}
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-1">
          {notification.message}
        </p>
        <span className="text-[10px] text-gray-500 font-medium">
          <FormattedDate isoString={notification.date} /> at <FormattedTime isoString={notification.date} />
        </span>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      )}
    </div>
  );
}
