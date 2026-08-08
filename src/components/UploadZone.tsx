'use client';

import { useCallback, useState } from 'react';
import { UploadCloud, FileType, CheckCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { generateExcel } from '../lib/excelExport';

export default function UploadZone() {
  const { file, setFile, isProcessing, setIsProcessing, setTransactions } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = async (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid PDF or Image file.');
      return;
    }
    
    setError(null);
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/parse-statement', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse document');
      }

      const data = await response.json();
      setTransactions(data.transactions);

    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div
          className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-500 ease-out shadow-sm ${
            isDragging 
              ? 'border-blue-400 bg-blue-50/80 scale-[1.02] shadow-blue-500/20 shadow-xl' 
              : 'border-slate-300/80 bg-white/50 hover:bg-white/80 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center justify-center space-y-5 text-center pointer-events-none p-8 z-0">
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 rounded-full"></div>
                <Loader2 className="w-16 h-16 text-blue-500 relative z-10" />
              </motion.div>
            ) : file ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-40 rounded-full"></div>
                <CheckCircle className="w-16 h-16 text-emerald-500 relative z-10" />
              </motion.div>
            ) : (
              <div className="p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:-translate-y-2 group-hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] transition-all duration-500">
                <UploadCloud className="w-10 h-10 text-blue-500" />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-700">
                {isProcessing 
                  ? 'กำลังวิเคราะห์ด้วย AI...' 
                  : file 
                    ? file.name 
                    : 'อัปโหลดสลิป หรือ Bank Statement'}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                {isProcessing 
                  ? 'กรุณารอสักครู่ ระบบกำลังแยกรหัสและตัวเลขให้คุณอย่างแม่นยำ' 
                  : 'ลากไฟล์ (PDF, JPG, PNG) มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
              </p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 shadow-sm">
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
