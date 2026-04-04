import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  uid: string;
  email: string | null;
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
    // Set up Firebase auth persistence listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in – restore from Firebase
        const token = await firebaseUser.getIdToken();
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            accessToken: token,
          },
          isAuthLoading: false,
          isInitialized: true,
        });
      } else {
        // User is logged out
        set({
          user: null,
          isAuthLoading: false,
          isInitialized: true,
        });
      }
    });
  },
}));