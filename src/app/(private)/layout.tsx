// C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header/header-server"
import { ChartColumnBig, LayoutDashboard, Pen } from "lucide-react"
import Link from "next/link"

function NavIcon({
  href,
  children,
  disabled,
}: {
  href?: string
  children: React.ReactNode
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg opacity-60 cursor-not-allowed">
        {children}
      </div>
    )
  }

  return (
    <Link
      href={href!}
      className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition"
    >
      {children}
    </Link>
  )
}

function SideNav() {
  return (
    <div className="hidden sm:flex w-12 mt-12 backdrop-blur-md items-center pl-1 pt-5 gap-5 flex-col">
      <NavIcon href="/project">
        <LayoutDashboard className="h-5 w-5" />
      </NavIcon>

      <NavIcon href="/material-editor">
        <Pen className="h-5 w-5" />
      </NavIcon>

      <NavIcon disabled>
        <ChartColumnBig className="h-5 w-5" />
      </NavIcon>
    </div>
  )
}

function MobileNav() {
  return (
    <footer className="flex justify-around items-center sm:hidden h-12">
      <NavIcon href="/project">
        <LayoutDashboard className="h-5 w-5" />
      </NavIcon>

      <NavIcon href="/material-editor">
        <Pen className="h-5 w-5" />
      </NavIcon>

      <NavIcon disabled>
        <ChartColumnBig className="h-5 w-5" />
      </NavIcon>
    </footer>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col max-w-screen-2xl mx-auto">
      <Header />

      <div className="flex flex-1 h-full">
        <SideNav />

        <main className="flex-1 min-h-0 p-2 md:px-6 mt-12 overflow-y-auto">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}