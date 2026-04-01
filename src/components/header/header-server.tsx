//C:\Users\chiso\nextjs\study-allot\src\components\header\header-server.tsx
import SettingsSheetServer from "@/components/settings/settings-sheet-server"
import HeaderClient from "./header-client"
import CurrentTime from "../current-time"

export default function Header() {
  return (

    <div className="mx-auto w-full flex h-full max-w-screen-2xl items-center justify-between px-3">
      <HeaderClient />
      <div className="hidden lg:flex">
      <CurrentTime />
      </div>
      <SettingsSheetServer />
    </div>
  )
}