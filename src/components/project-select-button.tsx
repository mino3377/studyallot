"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type ProjectLite = { id: number; name: string; slug: string }

export function ProjectSelectButton({ projects }: { projects: ProjectLite[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const current = sp.get("project") ?? "all" // "all" | project.slug

  const [open, setOpen] = React.useState(false)

  const display = current === "all"
    ? "すべてのプロジェクト"
    : (projects.find(p => p.slug === current)?.name ?? "プロジェクトを選択")

  const items = [{ slug: "all", name: "すべてのプロジェクト" }, ...projects.map(p => ({ slug: p.slug, name: p.name }))]

  function onSelect(next: string) {
    const params = new URLSearchParams(sp.toString())
    if (next === "all") params.delete("project")
    else params.set("project", next)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[240px] justify-between">
          {display}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="プロジェクトを検索..." className="h-9" />
          <CommandList>
            <CommandEmpty>見つかりません</CommandEmpty>
            <CommandGroup heading="プロジェクト">
              {items.map(it => (
                <CommandItem
                  key={it.slug}
                  // 検索用に "slug name" の複合値にして、名前検索でもヒットさせる
                  value={`${it.slug} ${it.name}`}
                  // onSelect には slug を確実に渡す
                  onSelect={() => onSelect(it.slug)}
                >
                  {it.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      current === it.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
