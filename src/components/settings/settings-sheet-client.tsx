"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import SettingsContent from "./settings-content"

export default function SettingsSheetClient({ user }: { user: unknown }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="設定を開く">
                    <Settings className="w-5 h-5" />
                </Button>
            </SheetTrigger>

           <SheetContent
  side="right"
  className="p-4 w-60 flex flex-col mt-12 rounded-l-md h-[calc(100vh-3rem)]"
>
                <SheetHeader>
                    <SheetTitle>設定</SheetTitle>
                </SheetHeader>

                <div className="mt-4 flex-1 min-h-0 overflow-y-auto">
                    <SettingsContent user={user} />
                </div>
            </SheetContent>
        </Sheet>
    )
}