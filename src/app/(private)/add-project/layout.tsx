import type { ReactNode } from "react"
import AddSubHeader from "@/components/add-sub-header"

export default function AddProjectLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-[900px] px-4 md:px-6 py-6">
      <AddSubHeader
        title="新規プロジェクト"
        subtitle="プロジェクト名・期間・目標などを設定します。"
      />
      <main className="mt-6">{children}</main>
    </section>
  )
}
