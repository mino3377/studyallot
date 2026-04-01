//C:\Users\chiso\nextjs\study-allot\src\components\tooltip.tsx

import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
    children: React.ReactNode
    comment: string
    buttonClick: () => void
}

export function TooltipButton({
    children,
    comment,
    buttonClick
}: Props) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" onClick={buttonClick}>{children}</Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{comment}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
