import type { ReactNode } from "react"
import AddSubHeader from "@/components/add-sub-header"

export default function AddProjectLayout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-4 md:px-6 py-6">
      <AddSubHeader
        title="新規プロジェクト"
      />
      <main className="mt-6">{children}</main>
    </section>
  )
}
