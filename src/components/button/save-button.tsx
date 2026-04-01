"use client"

import React from 'react'
import { Button } from '../ui/button'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useFormStatus } from "react-dom"

type Props = {
    isDisabled: boolean,
    errorMessage: string | undefined
}

export default function SaveButton({
    isDisabled,
    errorMessage
}: Props) {
    const { pending } = useFormStatus()

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className='w-full'>
                        <Button
                            type='submit'
                            disabled={isDisabled || pending}
                            className={`w-full ${(isDisabled || pending) ? "bg-muted-foreground hover:bg-muted-foreground" : "bg-black"}`}
                        >
                            {pending ? "保存中..." : "保存"}
                        </Button>
                    </div>
                </TooltipTrigger>
                {errorMessage ? (
                    <TooltipContent>
                        <div>{errorMessage}</div>
                    </TooltipContent>
                ) : null}
            </Tooltip>
        </TooltipProvider>
    )
}