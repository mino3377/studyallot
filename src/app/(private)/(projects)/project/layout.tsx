// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import SubHeader from "@/components/sub-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-4 md:px-6 py-6">
      <SubHeader title={"プロジェクト"}></SubHeader>
      <main className="">{children}</main>
    </section>
  );
}
