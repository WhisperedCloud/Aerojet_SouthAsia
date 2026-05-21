import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// uuid is not needed, we use crypto.randomUUID()

export type NotificationType = 'booking' | 'flight' | 'payment' | 'system' | 'reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  date: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
            read: false,
            date: new Date().toISOString()
          },
          ...state.notifications
        ]
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      
      clearAll: () => set({ notifications: [] })
    }),
    {
      name: 'aerojet-notifications',
    }
  )
);
