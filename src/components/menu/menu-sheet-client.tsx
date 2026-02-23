// src/components/menu/menu-sheet-client.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MenuContent from "./menu-content";

export default function MenuSheetClient({ user }: { user: unknown }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="メニューを開く">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-60 p-6">
        <SheetHeader>
          <SheetTitle className="sr-only">メニュー</SheetTitle>
        </SheetHeader>
        <MenuContent user={user} />
      </SheetContent>
    </Sheet>
  );
}
