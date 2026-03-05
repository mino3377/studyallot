// C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\_components\select-toggle.tsx
"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check } from "lucide-react"

export type SelectToggleItem = {
  id: string
  label: string
}

export default function MaterialSelectToggle({
  items,
  selectedId,
  placeholder = "選択してください",
  emptyMessage = "選択肢がありません",
  open,
  onOpenChange,
  onSelect,
  triggerHandlers,
  disabled,
}: {
  items: readonly SelectToggleItem[]
  selectedId?: string
  placeholder?: string
  emptyMessage?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (id: string) => void
  triggerHandlers?: {
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
    onClickCapture?: React.MouseEventHandler<HTMLDivElement>
    onPointerDown?: React.PointerEventHandler<HTMLDivElement>
    onPointerMove?: React.PointerEventHandler<HTMLDivElement>
    onPointerUp?: React.PointerEventHandler<HTMLDivElement>
    onPointerCancel?: React.PointerEventHandler<HTMLDivElement>
  }
  disabled?: boolean
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = typeof open === "boolean"
  const actualOpen = isControlled ? open : internalOpen

  const setOpen = (v: boolean) => {
    if (disabled) return
    if (!isControlled) setInternalOpen(v)
    onOpenChange?.(v)
  }

  const selectedLabel =
    selectedId ? items.find((x) => x.id === selectedId)?.label : undefined

  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>
  }

  const isPlaceholder = !selectedLabel

  return (
    <Popover open={disabled ? false : actualOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled ? true : undefined}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === "Enter" || e.key === " ") setOpen(!actualOpen)
            triggerHandlers?.onKeyDown?.(e)
          }}
          onClickCapture={(e) => {
            if (disabled) {
              e.preventDefault()
              e.stopPropagation()
              return
            }
            triggerHandlers?.onClickCapture?.(e)
          }}
          onPointerDown={(e) => {
            if (disabled) {
              e.preventDefault()
              e.stopPropagation()
              return
            }
            triggerHandlers?.onPointerDown?.(e)
          }}
          onPointerMove={disabled ? undefined : triggerHandlers?.onPointerMove}
          onPointerUp={disabled ? undefined : triggerHandlers?.onPointerUp}
          onPointerCancel={disabled ? undefined : triggerHandlers?.onPointerCancel}
          className={[
            "p-3 border rounded-sm transition-all duration-200",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow",
            "bg-card hover:bg-muted/20",
          ].join(" ")}
          onClick={() => {
            if (disabled) return
            setOpen(!actualOpen)
          }}
        >
          <div className="space-y-1">
            <div
              className={[
                "flex items-center text-base font-medium",
                isPlaceholder ? "text-muted-foreground font-medium" : "",
              ].join(" ")}
            >
              {selectedLabel ?? placeholder}
            </div>
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
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return
                    onSelect?.(it.id)
                    setOpen(false)
                  }}
                  className={[
                    "w-full flex items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                    active ? "bg-emerald-500/15" : "hover:bg-muted",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{it.label}</span>
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