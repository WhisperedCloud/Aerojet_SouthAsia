import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface PassengerDetails {
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
}

export interface FlightStoreState {
  searchQuery: SearchQuery | null;
  selectedFlightId: string | null;
  selectedSeatIds: string[];
  bookingStep: 'search' | 'seats' | 'passenger' | 'confirmation';
  passengerDetails: PassengerDetails[] | null;
  optimisticSeatIds: string[];
  
  setSearchQuery: (query: SearchQuery) => void;
  selectFlight: (flightId: string) => void;
  toggleSeat: (seatId: string, maxSeats: number) => void;
  setPassengerDetails: (details: PassengerDetails[]) => void;
  setBookingStep: (step: FlightStoreState['bookingStep']) => void;
  setOptimisticSeatIds: (seatIds: string[]) => void;
  resetStore: () => void;
}

export const useFlightStore = create<FlightStoreState>()(
  persist(
    (set, get) => ({
      searchQuery: null,
      selectedFlightId: null,
      selectedSeatIds: [],
      bookingStep: 'search',
      passengerDetails: null,
      optimisticSeatIds: [],

      setSearchQuery: (searchQuery) => set({ searchQuery, bookingStep: 'search' }),
      selectFlight: (selectedFlightId) => set({ selectedFlightId, selectedSeatIds: [], optimisticSeatIds: [], bookingStep: 'seats' }),
      toggleSeat: (seatId, maxSeats) => {
        const state = get();
        let newSeats = [...state.selectedSeatIds];
        if (newSeats.includes(seatId)) {
          newSeats = newSeats.filter(id => id !== seatId);
        } else {
          if (newSeats.length < maxSeats) {
            newSeats.push(seatId);
          }
        }
        set({ selectedSeatIds: newSeats });
      },
      setPassengerDetails: (passengerDetails) => set({ passengerDetails, bookingStep: 'confirmation' }),
      setBookingStep: (bookingStep) => set({ bookingStep }),
      setOptimisticSeatIds: (optimisticSeatIds) => set({ optimisticSeatIds }),
      resetStore: () => set({
        searchQuery: null,
        selectedFlightId: null,
        selectedSeatIds: [],
        bookingStep: 'search',
        passengerDetails: null,
        optimisticSeatIds: [],
      }),
    }),
    {
      name: 'flight-store-storage',
      // partialize to exclude passportNo from localStorage for security compliance
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlightId: state.selectedFlightId,
        selectedSeatIds: state.selectedSeatIds,
        bookingStep: state.bookingStep,
        passengerDetails: state.passengerDetails ? state.passengerDetails.map(pd => ({
          fullName: pd.fullName,
          nationality: pd.nationality,
          dob: pd.dob,
          passportNo: '', // Excluded
        })) : null,
      }),
    }
  )
);
