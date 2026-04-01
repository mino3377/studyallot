import { StudyTimeBarChart } from '@/components/graph/study-time-bar-chart'
import { Material } from '@/lib/type/material_type'
import React from 'react'
import { RecordTask } from '../_lib/queries'
import Timer from '@/components/timer/timer'

type Props = {
    materialRow: Material[]
    recordRow: RecordTask[]
}

export default function Hero({
    materialRow,
    recordRow

}: Props) {
    return (
       <div className=" grid min-h-0 min-w-0 overflow-hidden gap-2 rounded-md p-2 lg:h-full lg:grid-cols-3 lg:mx-1 bg-linear-to-b from-black to-black/50">
            <div className="lg:col-span-2 flex min-h-0 min-w-0 overflow-hidden items-center justify-center rounded-2xl p-2">
                <StudyTimeBarChart materialRow={materialRow} recordRow={recordRow} />
            </div>

            <div className="hidden lg:col-span-1 lg:flex min-h-0 items-center justify-center rounded-2xl">
                <div className="size-full rounded-md" >
                    <Timer />
                </div>
            </div>
        </div>
    )
}
