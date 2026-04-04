import { create } from 'zustand';
import api from '@/lib/axios';

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
  transactions: StudentTransaction[];
  isLoading: boolean;
  fetchTransactions: (email: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  transactions: [],
  isLoading: false,
  fetchTransactions: async (email) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/v1/transactions/user/${email}`);
      set({ transactions: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      set({ isLoading: false });
    }
  }
}));