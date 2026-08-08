'use client';

import UploadZone from '@/components/UploadZone';
import TransactionPreview from '@/components/TransactionPreview';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { transactions } = useStore();

  return (
    <main className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-emerald-50 flex flex-col items-center justify-center p-4 sm:p-8 transition-all duration-300">
      <div className={`w-full bg-white/60 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 rounded-[2rem] p-8 md:p-14 border border-white/80 relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${transactions.length > 0 ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/80 border border-blue-100 shadow-sm backdrop-blur-sm">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">AI-Powered Extraction</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight">
            Statement to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Excel</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            แปลงใบแจ้งยอดบัตรเครดิตหรือสลิปโอนเงินให้เป็นไฟล์ Excel พร้อมใช้งานแบบอัตโนมัติ ด้วยความแม่นยำสูง
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
