'use client';

import UploadZone from '@/components/UploadZone';
import TransactionPreview from '@/components/TransactionPreview';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { transactions } = useStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8 transition-all duration-300">
      <div className={`w-full bg-white shadow-xl rounded-3xl p-8 md:p-12 border border-slate-100 relative overflow-hidden transition-all duration-300 ${transactions.length > 0 ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 mb-4 tracking-tight">
            Statement to Excel
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            แปลงใบแจ้งยอดบัตรเครดิตหรือบัญชีธนาคารให้เป็นไฟล์ Excel พร้อมใช้งานแบบอัตโนมัติ
          </p>
        </div>

        {transactions.length > 0 ? (
          <TransactionPreview />
        ) : (
          <UploadZone />
        )}
      </div>
    </main>
  );
}
