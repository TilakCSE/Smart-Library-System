import { create } from 'zustand';
import api from "@/lib/axios"; // Import your Axios connection

export interface Book {
  id?: string; // Optional because DB generates it
  title: string;
  author: string;
  isbn: string;
  cover_image_url: string; // Changed to match Python model (snake_case)
  category: string;
  unity_location_id: string; // Changed to match Python
  totalCopies: number;
  availableCopies: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface InventoryState {
  books: Book[];
  isLoading: boolean;
  fetchBooks: () => Promise<void>;
  addBook: (book: Book) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  books: [], // Start empty, fetch from DB later
  isLoading: false,

  // 1. Fetch Books from Python
  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/books/");
      // Transform Python data (snake_case) to Frontend data if needed
      // For now, we assume the API returns the list directly
      set({ books: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      set({ isLoading: false });
    }
  },

  // 2. Add Book to Python
  addBook: async (book) => {
    try {
      // Send to Backend
      await api.post("/api/v1/books/add", {
        ...book,
        // Ensure field names match Python Model exactly!
        cover_image_url: book.cover_image_url,
        unity_location_id: book.unity_location_id
      });
      
      // If success, add to local list immediately (Optimistic UI)
      set((state) => ({ books: [...state.books, book] }));
      
    } catch (error) {
      console.error("Failed to add asset:", error);
      alert("Failed to save to database. Check console.");
    }
  },
}));