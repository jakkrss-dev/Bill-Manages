import { create } from 'zustand';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  sourceFile?: string; // เพิ่มฟิลด์สำหรับบอกว่ามาจากไฟล์ไหน
}

interface AppState {
  files: File[];
  setFiles: (files: File[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
