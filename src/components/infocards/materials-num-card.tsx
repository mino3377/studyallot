import { Layers} from 'lucide-react'
import React from 'react'
import { Card } from '../ui/card'

type MaterialsNumCardProps = {
    totalMaterials: number,
    activeMaterials: number,
    title?: string
}

export default function MaterialsNumCard({ title = "教材数", totalMaterials, activeMaterials }: MaterialsNumCardProps) {
    return (
        <Card className="gap-3 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{title}</div>
                <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 text-2xl font-semibold sm:mr-2">{totalMaterials}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                 {activeMaterials}件 進行中
            </div>
        </Card>
    )
}
