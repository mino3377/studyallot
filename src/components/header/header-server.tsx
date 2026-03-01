// src/components/header.tsx 
import MenuSheetServer from "@/components/menu/menu-sheet-server"
import HeaderClient from "./header-client"

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-12 border-b border-border/60">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md" />
      <div className="relative mx-auto flex h-full max-w-screen-2xl items-center justify-between px-3">
         <HeaderClient />
        <MenuSheetServer />
       
      </div>
    </header>
  )
}
