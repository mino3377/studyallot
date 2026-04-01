// C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header/header-server"
import { SideNav } from "@/components/navigation/side-navigation"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-screen w-screen flex flex-col max-w-screen-2xl mx-auto bg-linear-to-b from-black to-black/30 font-serif">
      <div className="w-screen h-12 shrink-0">
        <Header />
      </div>

      <div className="flex flex-1 min-h-0 w-full">
        <SideNav />

        <main
          className="flex flex-col w-full h-full min-w-0 rounded-t-2xl"
          style={{
            background: "linear-gradient(135deg, #D3D8E0 0%, #C4CAD4 55%, #B8BFCA 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  )
}