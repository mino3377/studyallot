//C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header/header-server"
import InitTimezone from "./_timezone/InitTimezone"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <InitTimezone />

      <div className="flex justify-center mt-12 overflow-y-auto">
        <div className="w-full mx-3 h-[calc(100vh-3rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
