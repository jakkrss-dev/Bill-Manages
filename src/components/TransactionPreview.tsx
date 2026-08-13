'use client';

import { useStore } from '../store/useStore';
import { generateExcel } from '../lib/excelExport';
import { Download, ArrowLeft, ArrowUpRight, ArrowDownRight, FileText, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TransactionPreview() {
  const { transactions, setTransactions, files, setFiles } = useStore();
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  useEffect(() => {
    if (files && files.length > 0) {
      const urls = files.map(f => URL.createObjectURL(f));
      setFileUrls(urls);
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [files]);

  const handleDownload = async () => {
    await generateExcel(transactions);
  };

  const handleReset = () => {
    setTransactions([]);
    setFiles([]);
  };

  if (transactions.length === 0) return null;

  const activeFile = files[activeFileIndex];
  const activeUrl = fileUrls[activeFileIndex];
  const isImage = activeFile?.type.startsWith('image/');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto mt-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/5 border border-white overflow-hidden flex flex-col"
    >
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 shrink-0 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ตรวจสอบข้อมูล (Review Data)</h2>
          <p className="text-sm text-slate-500 mt-1">
            ดึงข้อมูลสำเร็จ {transactions.length} รายการ จากทั้งหมด {files.length} ไฟล์
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            อัปโหลดใหม่
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลด Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[700px]">
        {/* Document Viewer (Left Side) */}
        <div className="w-full lg:w-5/12 border-r border-slate-100 bg-slate-50/30 p-4 flex flex-col h-[400px] lg:h-full">
          {files.length > 1 && (
            <div className="flex overflow-x-auto pb-3 gap-2 mb-2 custom-scrollbar shrink-0">
              {files.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeFileIndex === idx 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span className="max-w-[100px] truncate">{f.name}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="w-full h-full bg-white rounded-xl shadow-inner overflow-hidden border border-slate-200/60 flex-1">
            {activeUrl && (
              isImage ? (
                <img src={activeUrl} alt="Uploaded Slip" className="w-full h-full object-contain bg-slate-50" />
              ) : (
                <object data={`${activeUrl}#toolbar=0&navpanes=0`} type="application/pdf" className="w-full h-full">
                  <div className="flex items-center justify-center h-full text-slate-500">
                    เบราว์เซอร์ของคุณไม่รองรับการแสดงผล PDF
                  </div>
                </object>
              )
            )}
          </div>
        </div>

        {/* Data Table (Right Side) */}
        <div className="w-full lg:w-7/12 overflow-y-auto bg-white/50">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md shadow-sm z-10">
              <tr className="text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">วันที่</th>
                <th className="p-4 font-medium">รายละเอียด</th>
                <th className="p-4 font-medium">ไฟล์ต้นฉบับ</th>
                <th className="p-4 font-medium text-right">ยอดเข้า</th>
                <th className="p-4 font-medium text-right">ยอดออก</th>
                <th className="p-4 font-medium">หมายเหตุ</th>
                <th className="p-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors text-sm group">
                  <td className="p-2 text-slate-700 whitespace-nowrap font-medium">
                    <input 
                      type="text" 
                      value={tx.date} 
                      onChange={(e) => {
                        const newTxs = [...transactions];
                        newTxs[idx].date = e.target.value;
                        setTransactions(newTxs);
                      }}
                      className="w-full max-w-[90px] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-2 py-1 rounded transition-colors"
                    />
                  </td>
                  <td className="p-2 text-slate-700">
                    <input 
                      type="text" 
                      value={tx.description} 
                      onChange={(e) => {
                        const newTxs = [...transactions];
                        newTxs[idx].description = e.target.value;
                        setTransactions(newTxs);
                      }}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-2 py-1 rounded transition-colors"
                    />
                  </td>
                  <td className="p-2 text-slate-500 text-xs max-w-[100px] truncate" title={tx.sourceFile}>
                    {tx.sourceFile}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {tx.type === 'deposit' ? (
                      <div className="flex items-center justify-end gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100/50">
                        <ArrowDownRight className="w-3 h-3 shrink-0" />
                        <span className="font-semibold">+</span>
                        <input
                          type="number"
                          value={tx.amount || ''}
                          onChange={(e) => {
                            const newTxs = [...transactions];
                            newTxs[idx].amount = parseFloat(e.target.value) || 0;
                            setTransactions(newTxs);
                          }}
                          className="w-20 text-right bg-transparent font-semibold focus:outline-none focus:border-emerald-400 border-b border-transparent"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          const newTxs = [...transactions];
                          newTxs[idx].type = 'deposit';
                          setTransactions(newTxs);
                        }} 
                        className="text-[10px] text-slate-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        เปลี่ยนเป็นรายรับ
                      </button>
                    )}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {tx.type === 'withdrawal' ? (
                      <div className="flex items-center justify-end gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-100/50">
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                        <span className="font-semibold">-</span>
                        <input
                          type="number"
                          value={tx.amount || ''}
                          onChange={(e) => {
                            const newTxs = [...transactions];
                            newTxs[idx].amount = parseFloat(e.target.value) || 0;
                            setTransactions(newTxs);
                          }}
                          className="w-20 text-right bg-transparent font-semibold focus:outline-none focus:border-rose-400 border-b border-transparent"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          const newTxs = [...transactions];
                          newTxs[idx].type = 'withdrawal';
                          setTransactions(newTxs);
                        }} 
                        className="text-[10px] text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        เปลี่ยนเป็นรายจ่าย
                      </button>
                    )}
                  </td>
                  <td className="p-2 text-slate-700">
                    <input 
                      type="text" 
                      value={tx.remark || ''}
                      placeholder="เพิ่มหมายเหตุ..."
                      onChange={(e) => {
                        const newTxs = [...transactions];
                        newTxs[idx].remark = e.target.value;
                        setTransactions(newTxs);
                      }}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-2 py-1 rounded transition-colors text-xs placeholder:text-slate-300"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button 
                      onClick={() => {
                        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
                          const newTxs = [...transactions];
                          newTxs.splice(idx, 1);
                          setTransactions(newTxs);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center sticky bottom-0 z-10 backdrop-blur-md">
            <button
              onClick={() => {
                const newTx = {
                  date: new Date().toLocaleDateString('en-GB'),
                  description: 'รายการใหม่',
                  amount: 0,
                  type: 'withdrawal' as const,
                  sourceFile: 'Manual Entry',
                  remark: ''
                };
                setTransactions([...transactions, newTx]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการด้วยตัวเอง
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
