//C:\Users\chiso\nextjs\study-allot\src\components\menu-sidebar-client.tsx

"use client";

import { BookOpen, CalendarClock, CirclePlus, FolderOpenDot, LayoutDashboard, Sparkle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import MenuLinkButton from "./menu-link-button";
import { Button } from "./ui/button";
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


export default function MenuSidebarClient({ user }: { user: unknown }) {
    const meta = extractMeta(user);
    const avatarUrl = meta.avatar_url ?? null;
    const fullName = meta.full_name ?? meta.name ?? "Guest";
    const initials = (Array.from(fullName).slice(0, 2).join("") || "?").toUpperCase();


    return (
        <aside
            className="hidden md:block fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r bg-background p-6 overflow-y-auto"
            aria-label="メインメニュー"
        >
            <div className="flex flex-col justify-between h-full">
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
                        <MenuLinkButton href="/add-textbook">
                            <div className="flex items-center gap-2">
                                <CirclePlus />
                                <span>マテリアル追加</span>
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
                        <MenuLinkButton href="/material">
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-5" aria-hidden />
                                <span>マテリアル</span>
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
                </div>
                <div>
                    <form className="w-full mt-6">
                        <Button className="w-full" variant="outline" formAction={logout}>ログアウト</Button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
