//C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header/header-server";
import MenuSidebarServer from "@/components/menu/menu-sidebar-server";
import InitTimezone from "./_timezone/InitTimezone"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <MenuSidebarServer />
      <InitTimezone />

      <div className="flex justify-center lg:fixed lg:left-60 mt-16 lg:w-[calc(100vw-15rem)] overflow-y-auto">
        <div className="w-full mx-3 md:w-[860px] h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
