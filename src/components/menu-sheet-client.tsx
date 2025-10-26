//C:\Users\chiso\nextjs\study-allot\src\components\menu-sheet-client.tsx

"use client";

import { Button } from "./ui/button";
import { CalendarClock, CirclePlus, FolderOpenDot, LayoutDashboard, Menu, Sparkle } from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import MenuLinkButton from "./menu-link-button";
import { logout } from "@/app/(auth)/login/actions";

type Meta = { avatar_url?: string | null; full_name?: string | null; name?: string | null };

function extractMeta(u: unknown): Meta {
  if (typeof u === "object" && u !== null && "user_metadata" in u) {
    const um = (u as { user_metadata?: unknown }).user_metadata;
    if (typeof um === "object" && um !== null) {
      const rec = um as Record<string, unknown>;
      return {
        avatar_url: typeof rec.avatar_url === "string" ? rec.avatar_url : null,
        full_name: typeof rec.full_name === "string" ? rec.full_name : undefined,
        name: typeof rec.name === "string" ? rec.name : undefined,
      };
    }
  }
  return {};
}


export default function MenuSheetClient({ user }: { user: unknown }) {

  const meta = extractMeta(user);
  const avatarUrl = meta.avatar_url ?? null;
  const fullName = meta.full_name ?? meta.name ?? "Guest";
  const initials = (Array.from(fullName).slice(0, 2).join("") || "?").toUpperCase();


  return (
    <Sheet>
      {/* モバイルで使うトグル（Header側でmd:hiddenしているのでここはそのまま） */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="メニューを開く">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-60 p-6">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center">
              <Avatar className="size-10 mr-3">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{fullName}</div>
                <div className="text-xs text-muted-foreground">
                  現在のプラン: <span className="text-green-500 font-medium">Free</span>
                </div>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        <nav className="space-y-1 mx-2">
          <MenuLinkButton href="/add-textbook">
            <div className="flex items-center gap-2">
              <CirclePlus />
              <span>教材追加</span>
            </div>
          </MenuLinkButton>
          <MenuLinkButton href="/add-project">
            <div className="flex items-center gap-2">
              <CirclePlus />
              <span>プロジェクト追加</span>
            </div>
          </MenuLinkButton>
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1 mx-2">
          <MenuLinkButton href="/dashboard">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-5" aria-hidden />
              <span>ダッシュボード</span>
            </div>
          </MenuLinkButton>
          <MenuLinkButton href="/daily-task">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-5" aria-hidden />
              <span>デイリータスク</span>
            </div>
          </MenuLinkButton>
          <MenuLinkButton href="/project">
            <div className="flex items-center gap-2">
              <FolderOpenDot className="size-5" aria-hidden />
              <span>プロジェクト</span>
            </div>
          </MenuLinkButton>
          <MenuLinkButton href="/upgrade">
            <div className="flex items-center gap-2">
              <Sparkle className="size-5" aria-hidden />
              <span>アップグレード</span>
            </div>
          </MenuLinkButton>
        </nav>

        <Separator className="my-4" />

        <SheetFooter>
          <form className="w-full">
            <Button className="w-full" variant="outline" formAction={logout}>ログアウト</Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
