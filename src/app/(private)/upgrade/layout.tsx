import type { ReactNode } from "react";
import SubHeader from "@/components/sub-header/sub-header";

export default function UpgradeLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <section className="mx-auto w-full max-w-[1400px] px-4 md:px-6 py-6">

        <SubHeader title={"プロジェクト"}></SubHeader>

        <main className="min-h-[60vh]">{children}</main>
      </section>
    </div>

  );
}
