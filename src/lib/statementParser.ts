export function parseStatementText(text: string) {
  const lines = text.split('\n');
  const transactions = [];
  
  // Regex ดักจับวันที่รูปแบบต่างๆ เช่น 01/12/2023, 01-12-66, 01/12/66, 01 Dec 2023
  // และตามด้วยข้อความ (Description) และตัวเลขจำนวนเงิน
  // นี่เป็นตัวอย่าง Regex ที่ค่อนข้างยืดหยุ่น แต่อาจต้องปรับตามฟอร์แมตจริงของธนาคาร
  
  // สมมติฟอร์แมต: DD/MM/YYYY [Description] [Amount]
  // ตัวอย่างบรรทัด: "15/08/2023 ร้านอาหาร ABC 1,500.00" หรือ "15/08/2023 โอนเงินออก -500.00"
  const regex = /^(\d{2}[-\/]\d{2}[-\/]\d{2,4}|\d{2}\s+[a-zA-Z]{3}\s+\d{2,4})\s+(.+?)\s+([+-]?\d{1,3}(?:,\d{3})*(?:\.\d+)?)$/;

  for (const line of lines) {
    const cleanLine = line.trim().replace(/\s{2,}/g, ' '); // ทำ Data Cleaning (ลบเว้นวรรคเกิน)
    
    // ข้ามบรรทัด Header หรือ Footer ที่ไม่น่าจะใช่ Transaction
    if (cleanLine.toLowerCase().includes('page') || cleanLine.includes('ยอดยกมา')) {
      continue;
    }

    const match = cleanLine.match(regex);
    if (match) {
      const dateStr = match[1];
      const description = match[2].trim();
      const amountStr = match[3];

      // แปลงยอดเงินเป็น Number (เอาลูกน้ำออก)
      const amount = parseFloat(amountStr.replace(/,/g, ''));
      
      transactions.push({
        date: dateStr,
        description: description,
        amount: Math.abs(amount),
        type: amount < 0 ? 'withdrawal' : 'deposit'
      });
    } else {
      // สำหรับบางธนาคาร จำนวนเงินอาจจะอยู่คนละบรรทัด หรือมีทั้ง Deposit/Withdrawal แยกคอลัมน์
      // สามารถเพิ่ม Logic Regex อื่นๆ ไว้รองรับ Fallback ได้ตรงนี้
    }
  }

  return transactions;
}
