"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import ThemeToggle from "@/components/theme-toggle"
import { logout } from "@/app/(auth)/login/actions"
import { LogOut, User, MessageSquare, Info } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

type Meta = {
  avatar_url?: string | null
  full_name?: string | null
  name?: string | null
}

function extractMeta(u: unknown): Meta {
  if (typeof u === "object" && u !== null && "user_metadata" in u) {
    const um = (u as { user_metadata?: unknown }).user_metadata
    if (typeof um === "object" && um !== null) {
      const rec = um as Record<string, unknown>
      return {
        avatar_url: typeof rec.avatar_url === "string" ? rec.avatar_url : null,
        full_name: typeof rec.full_name === "string" ? rec.full_name : undefined,
        name: typeof rec.name === "string" ? rec.name : undefined,
      }
    }
  }
  return {}
}

function extractUserId(u: unknown): string | null {
  if (typeof u === "object" && u !== null && "id" in u) {
    const id = (u as { id?: unknown }).id
    return typeof id === "string" && id.length > 0 ? id : null
  }
  return null
}

export default function SettingsContent({ user }: { user: unknown }) {
  const meta = extractMeta(user)
  const userId = extractUserId(user)
  const isAuthed = Boolean(userId)

  const avatarUrl = meta.avatar_url ?? null
  const fullName = (meta.full_name ?? meta.name ?? (isAuthed ? "User" : "Guest")) || "Guest"
  const initials = (Array.from(fullName).slice(0, 2).join("") || "?").toUpperCase()

  const feedbackUrl = "https://forms.gle/BMrRZCeqmLbbB3hF8"

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      <div>
        {/* ユーザー */}
        <div className="flex items-center">
          <Avatar className="mr-3 size-10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate font-semibold">{fullName}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="size-3" />
              {isAuthed ? "ログイン中" : "未ログイン"}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <ThemeToggle />
        <div className="mt-1 text-xs text-muted-foreground">画面の明るさ</div>

        <Separator className="my-4" />
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <a href={feedbackUrl} target="_blank" rel="noreferrer">
              <MessageSquare className="mr-2 size-4" />
              ご意見・不具合報告
            </a>
          </Button>

          <Button variant="outline" className="w-full justify-start" disabled>
            <Info className="mr-2 size-4" />
            StudyAllot v0.1.0
          </Button>
        </div>

        <Separator className="my-4" />
      </div>

      <div className="pt-4">
        {isAuthed ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <LogOut className="mr-2 size-4" />
                ログアウト
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
                <AlertDialogDescription>StudyAllotからログアウトします。</AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>

                <form action={logout}>
                  <AlertDialogAction asChild>
                    <button type="submit">ログアウト</button>
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="text-xs text-muted-foreground">
            ログアウトはログイン後に表示されます
          </div>
        )}
      </div>
    </div>
  )
}