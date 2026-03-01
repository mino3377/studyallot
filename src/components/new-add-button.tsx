// C:\Users\chiso\nextjs\study-allot\src\components\new-add-button.tsx
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