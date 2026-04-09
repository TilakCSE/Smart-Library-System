import { create } from 'zustand';
import api from '@/lib/axios';

// --- Geofence Configuration ---
// Replace these with the exact coordinates of the NUV Library Entrance if you want perfect accuracy!
const LIBRARY_LAT = 22.3175; 
const LIBRARY_LNG = 73.1678; 
const MAX_ALLOWED_DISTANCE = 50; // Max allowed distance in meters

// Haversine formula to calculate real-world distance in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

export interface StudentTransaction {
  id: string;
  book_title: string;
  book_author: string;
  cover_image_url: string;
  issue_date: string;
  due_date: string;
  status: 'active' | 'completed' | 'overdue';
  unity_location_id: string;
}

interface StudentState {
  // Transaction State
  transactions: StudentTransaction[];
  isLoading: boolean;
  fetchTransactions: (email: string) => Promise<void>;

  // Geofence State
  isLocating: boolean;
  locationError: string;
  verifyLocation: () => Promise<boolean>;
}

export const useStudentStore = create<StudentState>((set) => ({
  // ==========================================
  // 1. TRANSACTION LOGIC
  // ==========================================
  transactions: [],
  isLoading: false,
  
  fetchTransactions: async (email) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/v1/transactions/user/${email}`);
      set({ transactions: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // Force the spinner to turn off if Axios fails
      set({ isLoading: false, transactions: [] });
    }
  },

  // ==========================================
  // 2. GEOFENCE LOGIC
  // ==========================================
  isLocating: false,
  locationError: "",
  
  verifyLocation: async () => {
    set({ isLocating: true, locationError: "" });

    return new Promise((resolve) => {
      // Check if browser supports GPS
      if (!navigator.geolocation) {
        set({
          isLocating: false,
          locationError: "Geolocation is not supported by your browser.",
        });
        resolve(false);
        return;
      }

      // Request current GPS position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Calculate distance to library
          const distance = calculateDistance(
            latitude,
            longitude,
            LIBRARY_LAT,
            LIBRARY_LNG
          );

          // Check if student is within the radius
          if (distance > MAX_ALLOWED_DISTANCE) {
            set({
              isLocating: false,
              locationError: `Access Denied: You are ${distance} meters away from the Library Entry Gates.`,
            });
            resolve(false);
          } else {
            // Success!
            set({ isLocating: false, locationError: "" });
            resolve(true);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          set({
            isLocating: false,
            locationError: "Failed to verify location. Please ensure location permissions are granted.",
          });
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Force high accuracy
      );
    });
  },
}));