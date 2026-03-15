"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check } from "lucide-react"

export type SelectToggleItem = {
  id: string
  label: string
}

export default function ProjectSelectToggle({
  items,
  selectedId,
  placeholder = "プロジェクトを選択してください",
  open,
  onOpenChange,
  onSelect,
}: {
  items: SelectToggleItem[]
  selectedId?: string
  placeholder?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string) => void
}) {
  const emptyMessage = "プロジェクトがありません"

  const selectedProjectLabel = items.find((x) => x.id === selectedId)?.label

  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          role="button"
          className={[
            "p-3 border rounded-sm cursor-pointer transition-all duration-200",
            "hover:shadow",
            "bg-card hover:bg-muted/20",
          ].join(" ")}
        >
          <div className="space-y-1 flex items-center text-base font-medium">
            {selectedProjectLabel ?? placeholder}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        className="w-[min(520px,calc(100vw-1.5rem))] p-2"
      >
        <div className="max-h-[55vh] overflow-auto">
          <div className="space-y-1">
            {items.map((it) => {
              const active = selectedId === it.id
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    onSelect(it.id)
                    onOpenChange(false)
                  }}
                  className={[
                    "w-full flex items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors",
                    active ? "bg-muted" : "hover:bg-muted",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate font-semibold">{it.label}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}