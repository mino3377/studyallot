// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\project\layout.tsx
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full h-full flex flex-col flex-1 min-h-0">
      {children}
    </main>
  )
}