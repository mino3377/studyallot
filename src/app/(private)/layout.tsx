//C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header";
import MenuSidebarServer from "@/components/menu-sidebar-server";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <MenuSidebarServer />
      <div className="flex justify-center md:fixed md:left-60 mt-16  md:w-[calc(100vw-15rem)] overflow-y-auto ">
        <div className="md:w-[860px] h-[calc(100vh-4rem)] ">
          {children}
        </div>
      </div>
    </div>
  );
}
