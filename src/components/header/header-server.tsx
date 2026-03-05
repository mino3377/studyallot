//C:\Users\chiso\nextjs\study-allot\src\components\header\header-server.tsx
import SettingsSheetServer from "@/components/settings/settings-sheet-server"
import HeaderClient from "./header-client"

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-12 backdrop-blur-md">
      <div className="absolute inset-0" />
      <div className="relative mx-auto flex h-full max-w-screen-2xl items-center justify-between px-3">
        <HeaderClient />
        <SettingsSheetServer />
      </div>
    </header>
  )
}