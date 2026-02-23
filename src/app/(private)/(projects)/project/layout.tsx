// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\layout.tsx
import SubHeader from "@/components/sub-header/sub-header";
import type { ReactNode } from "react";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-4 md:px-6 py-6">
      <SubHeader title={"プロジェクト"}></SubHeader>
      <main className="">{children}</main>
    </section>
  );
}
