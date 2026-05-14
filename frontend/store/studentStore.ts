import { create } from 'zustand';

// --- Geofence Configuration ---
// Replace these with the exact coordinates of the NUV Library Entrance
const LIBRARY_LAT = 22.2929804;
const LIBRARY_LNG = 73.1223148;
const MAX_ALLOWED_DISTANCE = 50; // Max allowed distance in meters

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

interface StudentState {
  isLocating: boolean;
  locationError: string;
  verifyLocation: () => Promise<boolean>;
}

export const useStudentStore = create<StudentState>()((set) => ({
  isLocating: false,
  locationError: "",
  
  verifyLocation: async () => {
    set({ isLocating: true, locationError: "" });

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        set({
          isLocating: false,
          locationError: "Geolocation is not supported by your browser.",
        });
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distance = calculateDistance(latitude, longitude, LIBRARY_LAT, LIBRARY_LNG);

          if (distance > MAX_ALLOWED_DISTANCE) {
            set({
              isLocating: false,
              locationError: `Access Denied: You are ${distance} meters away from the Library Entry Gates.`,
            });
            resolve(false);
          } else {
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },
}));