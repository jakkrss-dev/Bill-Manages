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
    <div className="w-full max-w-2xl mx-auto mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-3xl border-3 border-dashed transition-all duration-300 ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4 text-center pointer-events-none p-6">
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="w-16 h-16 text-blue-500" />
              </motion.div>
            ) : file ? (
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-2" />
            ) : (
              <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-12 h-12 text-blue-600" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-700">
                {isProcessing 
                  ? 'กำลังประมวลผลไฟล์...' 
                  : file 
                    ? file.name 
                    : 'อัปโหลดไฟล์ Bank Statement หรือ Slip (PDF, Image)'}
              </h3>
              <p className="text-sm text-slate-500">
                {isProcessing 
                  ? 'ระบบกำลังแยกข้อมูลและสร้างไฟล์ Excel กรุณารอสักครู่' 
                  : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
              </p>
            </div>

            {error && (
              <div className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
