import type { ReactNode } from "react"
import AddSubHeader from "@/components/add-sub-header"

export default function AddMaterialLayout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-0 md:px-6 py-6">
      <AddSubHeader
        title="新規教材"
      />
      <main className="mt-6">{children}</main>
    </section>
  )
}
