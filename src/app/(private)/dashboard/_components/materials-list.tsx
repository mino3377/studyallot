// C:\Users\chiso\nextjs\study-allot\src\(private)/dashboard/materials-list.tsx
"use client"

import MaterialActionButtons from "@/components/material-action-buttons"
import { Material } from "@/lib/type/material_type"
import Link from "next/link"
import PieChart from "@/components/graph/pie-chart"
import { calcDoneTaskCount, recordTaskMap } from "../_lib/material-record-object-row"
import { CirclePlus, Divide } from "lucide-react"

type Props = {
    userId: string,
    materialRecordRow: { material: Material, record: recordTaskMap }[]
}

export default function MaterialsList({
    userId,
    materialRecordRow
}: Props) {

    return (
        <div className="space-y-2 h-[calc(100vh/2)] lg:h-full overflow-y-auto min-h-0">
            {materialRecordRow.length === 0 ? 
            <div className="w-full flex items-center justify-center">
                ↓↓↓ まずは教材を作成しましょう ↓↓↓
            </div>
            :
                materialRecordRow.map((m) => {
                    return (
                        <div className="grid grid-cols-5 p-2 rounded-md border select-none bg-white text-black text-sm lg:text-base lg:h-[calc(100vh/6.5)]" key={m.material.id}>
                            <div className=" min-h-0 min-w-0 col-span-4 flex flex-col justify-between">
                                <div>{m.material.title}</div>
                                {/* <Link href={`/material-detail/?material=${m.material.slug}`}>{m.material.title}</Link> */}
                                <div className="flex gap-2">
                                    <MaterialActionButtons userId={userId} id={m.material.id} title={m.material.title} slug={m.material.slug} />
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-center items-center">
                                <PieChart
                                    percent={Math.floor(
                                        (calcDoneTaskCount(m.record) /
                                            (m.material.unit_count * m.material.rounds)) *
                                        100
                                    )}

                                />
                            </div>
                        </div>
                    )
                })}

            <button className="w-full">
                <Link href={"/material-editor"} className="text-muted-foreground flex gap-3 items-center justify-center">
                    <CirclePlus className="size-5" />
                    <span>教材を追加</span>
                </Link>
            </button>
        </div>
    )
}