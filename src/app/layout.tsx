//C:\Users\chiso\nextjs\study-allot\src\app\layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyAllot - 逆算した",
  description:
    "教材・周回・進捗率を一元管理できる学習計画アプリ。",
  keywords: ["StudyAllot", "学習管理", "進捗管理", "逆算", "資格試験"],
  openGraph: {
    title: "StudyAllot",
    description: "学習計画を可視化するアプリ",
    url: "https://your-vercel-url.vercel.app",
    siteName: "StudyAllot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
