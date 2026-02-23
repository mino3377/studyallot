// app/dashboard/layout.tsx
import SubHeader from "@/components/sub-header/sub-header";
import type { ReactNode } from "react";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="hidden lg:flex lg:flex-col mx-auto w-full max-w-[1400px] px-4 lg:px-6 py-6">
      
      <SubHeader title={"ダッシュボード"}></SubHeader>

      <main className="min-h-[60vh]">{children}</main>
    </section>
  );
}
