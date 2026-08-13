import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Statement to Excel | AI Parser",
  description: "แปลงสลิปโอนเงินและ Bank Statement ให้เป็นไฟล์ Excel อัตโนมัติด้วย AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${promptFont.variable} font-sans h-full antialiased bg-slate-50`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
