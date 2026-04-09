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
  title: "StudyAllot | 勉強計画アプリ・学習管理アプリ",
  description:
     "教材を登録するだけで、逆算した学習計画と今日やるべきことが見える学習管理アプリ。進捗管理や学習記録にも対応。",
  openGraph: {
    title: "StudyAllot | 勉強計画アプリ・学習管理アプリ",
    description:
       "教材を登録するだけで、逆算した学習計画と今日やるべきことが見える学習管理アプリ。進捗管理や学習記録にも対応。",
    url: "https://studyallot.com",
    siteName: "StudyAllot",
    type: "website",
  },
}

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
