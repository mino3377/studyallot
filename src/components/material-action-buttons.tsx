"use client"

import { NotebookPen, Pencil } from 'lucide-react'
import React from 'react'
import { TooltipButton } from './tooltip'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import CheckSheet from '@/components/check-sheet/check-sheet'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { deleteMaterialById } from '@/lib/action'

type Props = {
    userId: string
    id: number
    slug: string
    title: string
}

export default function MaterialActionButtons({ userId, id, slug, title }: Props) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [openSheet, setOpenSheet] = React.useState<boolean>(false)
    const [openActionDialog, setOpenActionDialog] = React.useState<boolean>(false)
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState<boolean>(false)

    function handleGoEditorPage() {
        const params = new URLSearchParams(searchParams.toString())
        params.set("material", slug)
        setOpenActionDialog(false)
        router.push(`/material-editor?${params.toString()}`)
    }

    async function handleDeleteMaterial() {
        const result = await deleteMaterialById(id)
        if (result?.ok) {
            setOpenDeleteDialog(false)
            setOpenActionDialog(false)
            router.refresh()
        }
    }

    return (
        <>
            <Popover open={openActionDialog} onOpenChange={setOpenActionDialog}>
                <PopoverTrigger asChild>
                    <div>
                        <TooltipButton comment="編集" buttonClick={() => setOpenActionDialog(true)}>
                            <Pencil className='size-5 lg:size-6 hover:text-muted-foreground' />
                        </TooltipButton>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-auto p-2"
                >
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleGoEditorPage}>
                            編集
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenDeleteDialog(true)}
                        >
                            削除
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <TooltipButton comment="記録" buttonClick={() => setOpenSheet(true)}>
                <NotebookPen className='size-5 lg:size-6 hover:text-muted-foreground' />
            </TooltipButton>

            <CheckSheet
                userId={userId}
                id={id}
                open={openSheet}
                onOpenChenge={() => setOpenSheet(false)}
                title={title}
            />

            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この教材を削除します。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>いいえ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMaterial}>
                            はい
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}