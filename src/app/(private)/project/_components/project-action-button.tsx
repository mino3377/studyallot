import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { BookCheck, CalendarSync, Eraser, SquareCheckBig } from "lucide-react";
import Link from "next/link"
import * as React from "react"

type ProjectPageButtonProps = {
  href?: string
  ariaLabel?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLElement>
  asButton?: boolean
  disabled?: boolean
}

const baseClassName = `
  h-full w-full items-center justify-center gap-1
  px-4 py-2
  text-xs font-bold
  rounded-md
  transition
  bg-black dark:bg-white
  hover:bg-muted-foreground
  text-white dark:text-black
  flex flex-col justify-center items-center
`

export function ProjectPageButton({
  href,
  ariaLabel = "ボタン",
  children,
  onClick,
  asButton = false,
  disabled = false,
}: ProjectPageButtonProps) {
  if (asButton) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        disabled={disabled}
        className={baseClassName}
      >
        {children}
      </button>
    )
  }

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        onClick={onClick as any}
        className={baseClassName}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={baseClassName}
    >
      {children}
    </button>
  )
}

export function ProjectActionButton({
  openRename,
  toggleProjectProgress,
  replanAllDelayedInProject,
  isReplanning
}: {
  openRename: () => void,
  toggleProjectProgress: () => void,
  replanAllDelayedInProject: () => void | Promise<void>,
  isReplanning: boolean
}) {

  const [isOpenDialog, setIsOpenDialog] = React.useState<boolean>(false)

  const handleReplanConfirm = async () => {
    await replanAllDelayedInProject()
    setIsOpenDialog(false)
  }


  return (
    <>

      <div className="grid grid-cols-2 sm:grid-cols-4 sm:justify-start gap-2 items-center">
        <ProjectPageButton ariaLabel="プロジェクトを編集" onClick={openRename}>
          <Eraser className="h-7 w-7" />
          <div className="">プロジェクト編集</div>
        </ProjectPageButton>

        <ProjectPageButton ariaLabel="プロジェクトの進捗" onClick={toggleProjectProgress}>
          <SquareCheckBig className="h-7 w-7" />
          <div className="">プロジェクト進捗</div>
        </ProjectPageButton>

        <ProjectPageButton
          ariaLabel="計画の再配分"
          onClick={() => { setIsOpenDialog(true) }}
        >
          <CalendarSync className="h-7 w-7" />
          <div className="">{isReplanning ? "再配分中...." : "計画の再配分"}</div>
        </ProjectPageButton>

        <ProjectPageButton ariaLabel="本日タスク完了" onClick={toggleProjectProgress}>
          <BookCheck className="h-7 w-7" />
          <div className="">本日タスク完了</div>
        </ProjectPageButton>
      </div>

      <AlertDialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>計画を再配分しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              計画が均一になるように再配分されます。現在の計画内容が変わる可能性がありますが、よろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplanConfirm}>実行</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}    