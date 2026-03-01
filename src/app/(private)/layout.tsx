//C:\Users\chiso\nextjs\study-allot\src\app\(private)\layout.tsx

import Header from "@/components/header/header-server"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex max-w-screen-2xl mx-auto flex-col">
      <Header />

      <div className="mt-12 flex-1 min-h-0 p-2">
        {children}
      </div>
    </div>
  );
}
