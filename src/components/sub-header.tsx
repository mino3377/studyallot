import { Separator } from '@radix-ui/react-separator'
import React from 'react'
import SubHeaderIcon from './sub-header-icon'

export default function SubHeader({title}:{title:string}) {
    return (
        <>
            <header className="flex items-center gap-3">
                <div className="rounded-xl border bg-card text-card-foreground p-2">
                    <SubHeaderIcon title={title}/>
                </div>
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            </header>
            <Separator className="my-6" />
        </>
    )
}
