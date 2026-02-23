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
  title: "StudyAllot｜逆算して学習計画を自動配分",
  description:
    "教材を登録するだけで学習計画を自動配分。今日やること、進捗率、周回数、期限までの遅れを一元管理できる学習管理アプリ。",
  keywords: ["資格試験","学習管理アプリ","遅れ","進捗","タスク","教材","逆算","周回","受験"],
  openGraph: {
    title: "StudyAllot｜逆算して学習計画を自動配分",
    description: "教材を登録するだけで学習計画を自動配分。今日やること、進捗率、周回数、期限までの遅れを一元管理できる学習管理アプリ。",
    url: "https://studyallot.com",
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
