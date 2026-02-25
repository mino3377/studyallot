// src/components/menu/menu-content.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import MenuLinkButton from "@/components/menu/menu-link-button";
import { logout } from "@/app/(auth)/login/actions";
import {
  CirclePlus,
  Compass,
  FolderOpenDot,
} from "lucide-react";

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


export default function MenuContent({ user }: { user: unknown }) {
  const meta = extractMeta(user);
  const avatarUrl = meta.avatar_url ?? null;
  const fullName = meta.full_name ?? meta.name ?? "Guest";
  const initials = (Array.from(fullName).slice(0, 2).join("") || "?").toUpperCase();

  return (
    <div className="flex flex-col justify-between h-full overflow-y-auto">
      <div>
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

        <Separator className="my-4" />

        <nav className="space-y-1 mx-2">
          <MenuLinkButton href="/new-project">
            <div className="flex items-center gap-2">
              <CirclePlus />
              <span>新規プロジェクト</span>
            </div>
          </MenuLinkButton>
          <MenuLinkButton href="/new-material">
            <div className="flex items-center gap-2">
              <CirclePlus />
              <span>新規教材</span>
            </div>
          </MenuLinkButton>
        </nav>

        <Separator className="my-4" />
        <nav className="space-y-1 mx-2">
          {/* <div className="hidden lg:block">
            <MenuLinkButton href="/dashboard">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="size-5" aria-hidden />
                <span>ダッシュボード</span>
              </div>
            </MenuLinkButton>
          </div> */}

          <MenuLinkButton href="/project">
            <div className="flex items-center gap-2">
              <FolderOpenDot className="size-5" aria-hidden />
              <span>プロジェクト</span>
            </div>
          </MenuLinkButton>
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1 mx-2">
          <MenuLinkButton href="/guide">
            <div className="flex items-center gap-2">
              <Compass className="size-5" aria-hidden />
              <span>ガイド</span>
            </div>
          </MenuLinkButton>
        </nav>

      </div>


      <form className="w-full">
        <Button className="w-full" variant="outline" formAction={logout}>
          ログアウト
        </Button>
      </form>

    </div>
  );
}
