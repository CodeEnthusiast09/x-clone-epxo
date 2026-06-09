import { create } from 'zustand';
import type { User } from '@/interfaces/user.interface';

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
