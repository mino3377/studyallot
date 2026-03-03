//C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header/header-server"
import { ChartColumnBig, LayoutDashboard, Pen } from "lucide-react";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex max-w-screen-2xl mx-auto flex-col">
      <Header />
      <div className="flex h-full flex-1 ">
        <div className="hidden md:flex w-12 mt-12 backdrop-blur-md items-center pl-1 pt-5 gap-5 flex-col">
          <Link
            href="/project"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Link>
          <Link
            href="/new-add"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition"
          >
            <Pen className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg opacity-60 cursor-not-allowed">
            <ChartColumnBig className="h-5 w-5" />
          </div>

        </div>
        <div className="mt-12 flex-1 min-h-0 p-2">
          {children}
        </div>
      </div>
      <footer className="flex justify-around items-center md:hidden h-12">
        <Link
          href="/project"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition"
        >
          <LayoutDashboard className="h-5 w-5" />
        </Link>
        <Link
          href="/new-add"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition"
        >
          <Pen className="h-5 w-5" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg opacity-60 cursor-not-allowed">
          <ChartColumnBig className="h-5 w-5" />
        </div>
      </footer>

    </div>
  );
}
