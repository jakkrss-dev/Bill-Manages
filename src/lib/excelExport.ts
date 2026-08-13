import ExcelJS from 'exceljs';
import { Transaction } from '../store/useStore';

export async function generateExcel(transactions: Transaction[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transactions');

  // ตั้งค่า Header เป็นภาษาไทย
  worksheet.columns = [
    { header: 'วันที่', key: 'date', width: 15 },
    { header: 'รายละเอียด', key: 'description', width: 40 },
    { header: 'ไฟล์ต้นฉบับ', key: 'sourceFile', width: 20 },
    { header: 'ยอดเงินเข้า', key: 'deposit', width: 15 },
    { header: 'ยอดเงินออก', key: 'withdrawal', width: 15 },
    { header: 'หมายเหตุ', key: 'remark', width: 25 },
  ];

  // จัดรูปแบบ Header ให้สวยงาม
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Map ข้อมูลใส่ลง Excel
  transactions.forEach((tx) => {
    worksheet.addRow({
      date: tx.date,
      description: tx.description,
      sourceFile: tx.sourceFile || '',
      deposit: tx.type === 'deposit' ? tx.amount : '',
      withdrawal: tx.type === 'withdrawal' ? tx.amount : '',
      remark: tx.remark || '',
    });
  });

  // สร้างไฟล์เป็น Blob
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // สร้าง Link เพื่อให้ผู้ใช้ดาวน์โหลดไฟล์
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Peak_Import_Statement_Template.xlsx';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
