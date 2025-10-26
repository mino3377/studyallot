import type { ReactNode } from "react"
import AddSubHeader from "@/components/add-sub-header"

export default function AddTextbookLayout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-4 md:px-6 py-6">
      <AddSubHeader
        title="新規マテリアル"
        subtitle="マテリアル名・総セクション数・周回数・実施期間を設定します。"
      />
      <main className="mt-6">{children}</main>
    </section>
  )
}
