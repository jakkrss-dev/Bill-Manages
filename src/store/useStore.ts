import { create } from 'zustand';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
}

interface AppState {
  file: File | null;
  setFile: (file: File | null) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
