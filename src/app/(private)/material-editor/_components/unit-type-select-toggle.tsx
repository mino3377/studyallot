// C:\Users\chiso\nextjs\study-allot\src\app\(private)\material-editor\_components\select-toggle.tsx
"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check } from "lucide-react"
import { unit_type, UNIT_TYPE_ITEMS, unitLabel } from "@/lib/type/unit-type"

export type SelectToggleItem = {
  id: string
  label: string
}

type Props = {
  items: readonly SelectToggleItem[]
  selectedId: unit_type
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
}

export default function UnitTypeSelectToggle({
  selectedId,
  open,
  onOpenChange,
  onSelect,
  disabled,
}:
  Props
) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = typeof open === "boolean"
  const actualOpen = isControlled ? open : internalOpen

  const setOpen = (v: boolean) => {
    if (disabled) return
    if (!isControlled) setInternalOpen(v)
    onOpenChange?.(v)
  }

  return (
    <Popover open={disabled ? false : actualOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled ? true : undefined}
          className={[
            "p-3 border rounded-sm transition-all duration-200 font-semibold",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow",
            "bg-card hover:bg-muted/20",
          ].join(" ")}
          onClick={() => {
            if (disabled) return
            setOpen(!actualOpen)
          }}
        >
          {unitLabel(selectedId) ?? "選択してください"}
        </div>

      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        className="w-[min(520px,calc(100vw-1.5rem))] p-2"
      >
        <div className="max-h-[55vh] overflow-auto">
          <div className="space-y-1">
            {UNIT_TYPE_ITEMS.map((it) => {
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
                    "w-full flex items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors font-semibold",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                    active ? "bg-muted" : "hover:bg-muted",
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