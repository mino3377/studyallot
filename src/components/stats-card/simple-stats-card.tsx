import React from 'react'

type Props = {
    title: string,
    stats: number
    unit?:string,
}

export default function SimpleStatsCard({ title, stats,unit}: Props) {
    return (
        <div className='h-full min-h-0 p-1'>
            <div className='text-xs'>
                {title}
            </div>
            <div className='text-2xl lg:text-4xl w-full h-full min-h-0 flex justify-center items-start gap-1 lg:gap-2'>
                {stats}
                {unit?<div className='flex items-center h-full text-xs '>{unit}</div>:undefined}
            </div>
        </div>
    )
}
