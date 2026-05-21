import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  isInstallBannerVisible: boolean;
  setInstallBannerVisible: (visible: boolean) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      isInstallBannerVisible: true,
      setInstallBannerVisible: (visible) => set({ isInstallBannerVisible: visible }),
    }),
    {
      name: 'aerojet-ui',
    }
  )
);
