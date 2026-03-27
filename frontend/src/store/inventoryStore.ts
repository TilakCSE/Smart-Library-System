import { create } from 'zustand';
import api from "@/lib/axios"; 

export interface Book {
  id?: string; 
  title: string;
  author: string;
  isbn: string;
  cover_image_url: string; 
  category: string;
  unity_location_id: string; 
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

// Updated Initial Data following the Rack_X_Shelf_Y rule
const initialBooks: Book[] = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "9780262033848",
    cover_image_url: "https://m.media-amazon.com/images/I/61Pgdn8Ys-L._AC_UF1000,1000_QL80_.jpg",
    category: "Computer Science",
    unity_location_id: "Rack_1_Shelf_12", // Front side of Rack 1
    totalCopies: 5,
    availableCopies: 3,
    status: 'In Stock'
  },
  {
    id: "2",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    cover_image_url: "https://m.media-amazon.com/images/I/51E2055ZGUL._AC_UF1000,1000_QL80_.jpg",
    category: "Software Engineering",
    unity_location_id: "Rack_28_Shelf_45", // Back side of Rack 28
    totalCopies: 2,
    availableCopies: 0,
    status: 'Out of Stock'
  },
  {
    id: "3",
    title: "Design Patterns",
    author: "Erich Gamma",
    isbn: "9780201633610",
    cover_image_url: "https://m.media-amazon.com/images/I/917iQZBR91L._AC_UF1000,1000_QL80_.jpg",
    category: "Software Engineering",
    unity_location_id: "Rack_14_Shelf_5", // Front side of Rack 14
    totalCopies: 3,
    availableCopies: 1,
    status: 'Low Stock'
  }
];

export const useInventoryStore = create<InventoryState>((set) => ({
  books: initialBooks, 
  isLoading: false,

  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/books/");
      set({ books: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      set({ isLoading: false });
    }
  },

  addBook: async (book) => {
    try {
      await api.post("/api/v1/books/add", {
        ...book,
        cover_image_url: book.cover_image_url,
        unity_location_id: book.unity_location_id
      });
      set((state) => ({ books: [...state.books, book] }));
    } catch (error) {
      console.error("Failed to add asset:", error);
      alert("Failed to save to database. Check console.");
    }
  },
}));