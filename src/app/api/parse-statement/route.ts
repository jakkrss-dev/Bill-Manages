import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { parseStatementText } from '@/lib/statementParser';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // เช็คว่าผู้ใช้ใส่ API KEY หรือไม่
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_api_key_here') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro-latest",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        คุณคือผู้เชี่ยวชาญด้านบัญชี ฉันมีไฟล์ Bank Statement หรือ สลิปโอนเงิน (Slip)
        กรุณาวิเคราะห์เอกสารนี้และดึงรายการธุรกรรมทั้งหมดออกมา 
        
        รูปแบบที่ต้องการคือ JSON Array of objects เท่านั้น ห้ามมีข้อความอธิบายอื่นปน
        แต่ละ Object ต้องมี properties ดังนี้:
        - date (string): วันที่ทำรายการ รูปแบบ DD/MM/YYYY
        - description (string): รายละเอียดรายการ หรือ ชื่อผู้รับเงิน/ผู้โอน/สินค้า
        - amount (number): จำนวนเงินที่ทำรายการ (เป็นตัวเลขบวกเสมอ ห้ามมีลูกน้ำ)
        - type (string): เป็น 'deposit' (ยอดเข้า/รับเงิน) หรือ 'withdrawal' (ยอดออก/โอนเงิน/จ่ายบิล/ซื้อของ)
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.type
          }
        }
      ]);

      const responseText = result.response.text();
      const jsonString = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const transactions = JSON.parse(jsonString);

      return NextResponse.json({ transactions }, { status: 200 });
    } 

    // ---- Fallback (ถ้าไม่มี API KEY ให้ใช้ Regex บน PDF) ----
    if (file.type === 'application/pdf') {
      const data = await pdfParse(buffer);
      const text = data.text;
      const transactions = parseStatementText(text);
      return NextResponse.json({ transactions }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Image parsing requires GEMINI_API_KEY in .env.local' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('File parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process document' }, { status: 500 });
  }
}
