import { useDroppable } from '@dnd-kit/react'
import React from 'react'
import { CollisionPriority } from '@dnd-kit/abstract';
import { useSortable } from '@dnd-kit/react/sortable';

type Props = {
    id: string,
    index: number,
    title: string,
    column: string,
    children: React.ReactNode
}

export default function Column({ id, title, index, children }: Props) {

    const { ref } = useSortable({
        id,
        index,
        type: "column",
        accept: ["item", "column"],
        collisionPriority: CollisionPriority.Low
    })

    return (
        <div
            ref={ref} id={id}
            className=' bg-linear-to-b from-black to-black/50 p-2 shadow-md rounded-2xl max-w-60  w-[calc(100vw/1.3)] sm:w-[calc(100vw/3)] lg:max-w-80 lg:w-[calc(100vw/5)] h-full flex flex-col min-h-0 shrink-0'
        >
            <div className='text-white font-semibold h-10 overflow-hidden'>
                {title}
            </div>
            <div className='min-h-0 min-w-0 flex-1 overflow-y-auto space-y-2'>
                {children}
            </div>
        </div>
    )
}
