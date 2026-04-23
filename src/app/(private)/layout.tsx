import Header from "@/components/header/header-server"
import { SideNav } from "@/components/navigation/side-navigation"
import { Toaster } from "@/components/ui/sonner"
import LayoutTitle from "@/components/layout-title"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen flex flex-col max-w-screen-2xl mx-auto bg-linear-to-b from-black to-black/30 font-serif">
      <div className="w-screen h-12 shrink-0">
        <Header />
      </div>

      <div className="flex flex-1 min-h-0 w-full">
        <SideNav />

        <main className="flex flex-col w-full h-full min-w-0 rounded-t-2xl bg-stone-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col p-2">
              <LayoutTitle />
            </div>
          </div>
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  )
}