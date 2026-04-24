"use client"

import { monthLabelJP } from '@/lib/constant/period-label'
import { Material } from "@/lib/type/material_type"
import { Project } from '@/lib/type/project_type'
import React, { useEffect, useMemo, useState } from 'react'
import {
    buildGanttBarMaterials,
    filterMaterialRowByProjectSlug,
    getRangeFromMaterials,
    getSelectedProjectSlug,
    sortMaterialRow,
    sortProjectRow,
} from './data'
import { ProjectFilterDialog } from './components/project-filter-dialog'
import { MaterialHoverCard } from './components/material-hover-card'

type Props = {
    materialRow: Material[]
    projectRow: Project[]
}

export default function PageBody({ materialRow, projectRow }: Props) {
    const sortedProjectRow = useMemo(() => {
        return sortProjectRow(projectRow)
    }, [projectRow])

    const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | "all">("all")

    useEffect(() => {
        const syncFromUrl = () => {
            const params = new URLSearchParams(window.location.search)
            const nextSlug = getSelectedProjectSlug(params, sortedProjectRow)
            setSelectedProjectSlug(nextSlug)
        }

        syncFromUrl()
        window.addEventListener("popstate", syncFromUrl)

        return () => {
            window.removeEventListener("popstate", syncFromUrl)
        }
    }, [sortedProjectRow])

    const sortedMaterialRow = useMemo(() => {
        return sortMaterialRow(materialRow, sortedProjectRow)
    }, [materialRow, sortedProjectRow])

    const filteredMaterialRow = useMemo(() => {
        return filterMaterialRowByProjectSlug(
            sortedMaterialRow,
            sortedProjectRow,
            selectedProjectSlug
        )
    }, [sortedMaterialRow, sortedProjectRow, selectedProjectSlug])

    const { rangeArr, from, to } = useMemo(() => {
        return getRangeFromMaterials(filteredMaterialRow)
    }, [filteredMaterialRow])

    const ganttBarMaterials = useMemo(() => {
        return buildGanttBarMaterials(filteredMaterialRow, sortedProjectRow, rangeArr)
    }, [filteredMaterialRow, sortedProjectRow, rangeArr])

    const bodyHeight = Math.max(ganttBarMaterials.length * 56, 120)
    const colWidthClass = 'w-[calc(100vw/5)] md:w-[calc(100vw/8)] lg:w-[calc(100vw/14)] shrink-0'

    const colWidthVar = 'calc(100vw / 5)'

    const barStyle = (material: (typeof ganttBarMaterials)[number], i: number): React.CSSProperties => ({
        top: `${i * 56 + 8}px`,
        left: `calc(var(--gantt-col-width) * ${material.startIndex})`,
        width: `calc(var(--gantt-col-width) * ${material.endIndex - material.startIndex + 1})`,
    })

    function handleProjectSelect(projectSlug: string | "all") {
        setSelectedProjectSlug(projectSlug)

        const params = new URLSearchParams(window.location.search)

        if (projectSlug === "all") {
            params.delete("project")
        } else {
            params.set("project", projectSlug)
        }

        const query = params.toString()
        const nextUrl = query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname

        window.history.replaceState(null, "", nextUrl)
    }

    return (
        <div className='h-full w-full bg-stone-200 rounded-2xl text-black'>
            <div className='flex h-full w-full flex-col px-4 py-2'>
                <div className='shrink-0 pb-3'>
                    <div className='mt-4 w-full flex justify-end'>
                        <ProjectFilterDialog
                            projectRow={sortedProjectRow}
                            selectedProjectSlug={selectedProjectSlug}
                            onSelect={handleProjectSelect}
                        />
                    </div>
                </div>

                <div className='mt-4 flex min-h-0 flex-1 flex-col'>
                    <div className='mb-2 flex items-center justify-between'>
                        <div className='text-sm font-medium'>gantt chart</div>
                        <div className='text-xs text-black/45'>
                            教材数 {ganttBarMaterials.length}
                        </div>
                    </div>

                    <div className='min-h-0 flex-1 overflow-x-auto overflow-y-auto border-t border-black'>
                        <div
                            className='min-w-max [--gantt-col-width:calc(100vw/5)] md:[--gantt-col-width:calc(100vw/8)] lg:[--gantt-col-width:calc(100vw/14)]'
                        >
                            <div className='sticky top-0 z-20 flex border-b border-black/10'>
                                {rangeArr.map((date, index) => (
                                    <div
                                        key={`${date.getFullYear()}-${date.getMonth()}-${index}`}
                                        className={`${colWidthClass} flex h-12 flex-col justify-center border-r border-black/20 px-2`}
                                    >
                                        <span className='text-[10px] leading-none text-black/40'>
                                            {date.getFullYear()}
                                        </span>
                                        <span className='mt-1 text-sm leading-none'>
                                            {monthLabelJP[date.getMonth()]}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className='relative' style={{ height: `${bodyHeight}px` }}>
                                <div className='absolute inset-0 flex'>
                                    {rangeArr.map((date, index) => (
                                        <div
                                            key={`${date.getFullYear()}-${date.getMonth()}-line-${index}`}
                                            className={`${colWidthClass} h-full border-r border-black/15`}
                                        />
                                    ))}
                                </div>

                                <div className='absolute inset-0'>
                                    {ganttBarMaterials.map((_, i) => (
                                        <div
                                            key={`row-line-${i}`}
                                            className='absolute left-0 w-full border-b border-black/10'
                                            style={{
                                                top: `${i * 56 + 55}px`,
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className='absolute inset-0'>
                                    {ganttBarMaterials.map((material, i) => (
                                        <MaterialHoverCard key={material.id} material={material}>
                                            <div
                                                className='absolute flex h-10 items-center rounded-sm border border-black/10 bg-linear-to-b from-black to-gray-500 px-3 text-sm text-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]'
                                                style={barStyle(material, i)}
                                            >
                                                <span className='truncate'>
                                                    {material.title}
                                                </span>
                                            </div>
                                        </MaterialHoverCard>
                                    ))}
                                </div>
                            </div>

                            {ganttBarMaterials.length === 0 && (
                                <div className='py-10 text-sm text-black/45'>
                                    表示できる教材がありません
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}