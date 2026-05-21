import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookingCache {
  id: string;
  flight_id: string;
  seat_id: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  booked_at: string;
  total_price: number;
  pnr_code: string;
  flight: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
    arrives_at: string;
    aircraft_type: string;
    base_price: number;
  };
  seat: {
    seat_number: string;
    class: 'economy' | 'business' | 'first';
    extra_fee: number;
  };
  passengers: Array<{
    full_name: string;
    passport_no: string;
    nationality: string;
    dob: string;
  }>;
}

export interface UserStoreState {
  sessionToken: string | null;
  cachedBookings: BookingCache[];
  setSessionToken: (token: string | null) => void;
  setCachedBookings: (bookings: BookingCache[]) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      sessionToken: null,
      cachedBookings: [],
      
      setSessionToken: (sessionToken) => set({ sessionToken }),
      setCachedBookings: (cachedBookings) => set({ cachedBookings }),
      resetUser: () => set({ sessionToken: null, cachedBookings: [] }),
    }),
    {
      name: 'user-store-storage',
      // Persist both session token and bookings for offline access
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        cachedBookings: state.cachedBookings,
      }),
    }
  )
);
