"use client"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { GanttBarMaterial } from "../data"


type Props = {
  material: GanttBarMaterial
  children: React.ReactNode
}

export function MaterialHoverCard({ material, children }: Props) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>

      <HoverCardContent
        align="start"
        side="top"
        className="w-72 rounded-nmd border-black/20 p-4"
      >
        <div className="flex flex-col gap-2 text-sm text-black">
          <div className="text-base font-semibold">{material.title}</div>
          <div className="text-black/60">{material.projectTitle}</div>

          <div className="mt-1 grid grid-cols-[72px_1fr] gap-y-1 text-sm">
            <span className="text-black/45">期間</span>
            <span>
              {material.start_date} - {material.end_date}
            </span>

            <span className="text-black/45">量</span>
            <span>{material.unit_count}</span>

            <span className="text-black/45">周回</span>
            <span>{material.rounds}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}