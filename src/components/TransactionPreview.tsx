'use client';

import { useStore } from '../store/useStore';
import { generateExcel } from '../lib/excelExport';
import { Download, ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TransactionPreview() {
  const { transactions, setTransactions, file, setFile } = useStore();
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleDownload = async () => {
    await generateExcel(transactions);
  };

  const handleReset = () => {
    setTransactions([]);
    setFile(null);
  };

  if (transactions.length === 0) return null;

  const isImage = file?.type.startsWith('image/');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ตรวจสอบข้อมูล (Review Data)</h2>
          <p className="text-sm text-slate-500 mt-1">
            เปรียบเทียบเอกสารต้นฉบับกับข้อมูลที่ดึงออกมา จำนวน {transactions.length} รายการ
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            อัปโหลดใหม่
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm shadow-emerald-200"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลด Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[700px]">
        {/* Document Viewer (Left Side) */}
        <div className="w-full lg:w-1/2 border-r border-slate-200 bg-slate-100 p-4 h-[400px] lg:h-full">
          <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden border border-slate-300">
            {fileUrl && (
              isImage ? (
                <img src={fileUrl} alt="Uploaded Slip" className="w-full h-full object-contain" />
              ) : (
                <object data={`${fileUrl}#toolbar=0&navpanes=0`} type="application/pdf" className="w-full h-full">
                  <div className="flex items-center justify-center h-full text-slate-500">
                    เบราว์เซอร์ของคุณไม่รองรับการแสดงผล PDF กรุณาดาวน์โหลดไฟล์เพื่อดู
                  </div>
                </object>
              )
            )}
          </div>
        </div>

        {/* Data Table (Right Side) */}
        <div className="w-full lg:w-1/2 overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
              <tr className="text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">วันที่</th>
                <th className="p-4 font-medium">รายละเอียด</th>
                <th className="p-4 font-medium text-right">ยอดเข้า</th>
                <th className="p-4 font-medium text-right">ยอดออก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 text-slate-700 whitespace-nowrap">{tx.date}</td>
                  <td className="p-4 text-slate-700">{tx.description}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {tx.type === 'deposit' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <ArrowDownRight className="w-3 h-3" />
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {tx.type === 'withdrawal' ? (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                        <ArrowUpRight className="w-3 h-3" />
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td colSpan={2} className="p-4 font-bold text-slate-700 text-right">
                  ***** TOTAL BALANCE *****
                </td>
                <td className="p-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                  {transactions
                    .filter((tx) => tx.type === 'deposit')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-right font-bold text-rose-500 whitespace-nowrap">
                  {transactions
                    .filter((tx) => tx.type === 'withdrawal')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
