// app/dashboard/layout.tsx
import SubHeader from "@/components/sub-header/sub-header";
import type { ReactNode } from "react";


export default function DailyTaskLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 md:px-6 py-6">
      
      <SubHeader title={"デイリータスク"}></SubHeader>

      <main className="min-h-[60vh]">{children}</main>
    </section>
  );
}
