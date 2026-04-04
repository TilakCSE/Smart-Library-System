import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null; // <--- 1. ADD THIS HERE
  accessToken: string;
}

interface AuthState {
  user: User | null;
  isAuthLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName, // <--- 2. ADD THIS HERE
            accessToken: token,
          },
          isAuthLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          isAuthLoading: false,
          isInitialized: true,
        });
      }
    });
  },
}));