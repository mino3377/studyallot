// src/components/menu/menu-sidebar-client.tsx
"use client";

import MenuContent from "./menu-content";

export default function MenuSidebarClient({ user }: { user: unknown }) {
  return (
    <aside
      className="hidden lg:block fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r bg-background p-6 overflow-y-auto"
      aria-label="メインメニュー"
    >
      <MenuContent user={user} />
    </aside>
  );
}
