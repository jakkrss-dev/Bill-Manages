'use client';

import { useCallback, useState } from 'react';
import { UploadCloud, FileType, CheckCircle, Loader2 } from 'lucide-react';
import { useStore, Transaction } from '../store/useStore';
import { motion } from 'framer-motion';

export default function UploadZone() {
  const { files, setFiles, isProcessing, setIsProcessing, setTransactions, customPrompt, setCustomPrompt } = useStore();
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

  const processFiles = async (selectedFiles: FileList | File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const fileArray = Array.from(selectedFiles);
    
    // กรองเอาเฉพาะไฟล์ที่ถูกต้อง
    const validFiles = fileArray.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length === 0) {
      setError('Please upload valid PDF or Image files.');
      return;
    }
    
    setError(null);
    setFiles(validFiles);
    setIsProcessing(true);

    try {
      // โควต้าฟรีของ Gemini คือ 15 Request ต่อนาที (หรือประมาณ 1 ไฟล์ต่อ 4 วินาที)
      // เปลี่ยนมาส่งทีละ 1 ไฟล์ และพัก 4 วินาที เพื่อไม่ให้ชนเพดาน Limit
      const chunkSize = 1;
      let allTransactions: Transaction[] = [];

      for (let i = 0; i < validFiles.length; i += chunkSize) {
        const chunk = validFiles.slice(i, i + chunkSize);
        
        const processPromises = chunk.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          if (customPrompt.trim()) {
            formData.append('customPrompt', customPrompt);
          }

          const response = await fetch('/api/parse-statement', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
            try {
              const errData = await response.json();
              errorMsg = errData.error || errData.details || errorMsg;
            } catch (e) {
              // Not JSON
            }
            throw new Error(`[${file.name}] ${errorMsg}`);
          }

          const data = await response.json();
          return data.transactions.map((tx: any) => ({
            ...tx,
            sourceFile: file.name
          }));
        });

        const results = await Promise.all(processPromises);
        
        results.forEach(txs => {
          allTransactions = [...allTransactions, ...txs];
        });

        // Update state progressively after each chunk
        setTransactions([...allTransactions]);
        
        // หน่วงเวลา 4.5 วินาที เพื่อการันตีว่าจะไม่เกิน 13-15 Requests ต่อนาทีแน่นอน
        if (i + chunkSize < validFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 4500));
        }
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-slate-700 mb-2">
          คำสั่งเพิ่มเติมสำหรับ AI (Optional)
        </label>
        <textarea
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-sm text-sm"
          rows={3}
          placeholder="เช่น ช่วยดึงชื่อธนาคารต้นทางมาใส่ในช่อง description ด้วย..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          disabled={isProcessing}
        />
      </motion.div>

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
            multiple
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
            ) : files.length > 0 ? (
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
                  ? `กำลังวิเคราะห์ ${files.length} ไฟล์ด้วย AI...` 
                  : files.length > 0 
                    ? `อัปโหลดแล้ว ${files.length} ไฟล์` 
                    : 'อัปโหลดสลิป หรือ Bank Statement'}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                {isProcessing 
                  ? 'กรุณารอสักครู่ ระบบกำลังแยกรหัสและตัวเลขให้คุณอย่างแม่นยำ' 
                  : 'ลากหลายๆ ไฟล์ (PDF, รูป) มาวางรวมกันได้เลย หรือคลิกเลือกไฟล์'}
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
