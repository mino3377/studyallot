import Link from "next/link"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

type Props = {
  title: string
  subtitle?: string
  backHref?: string

}

export default function AddSubHeader({ title, subtitle }: Props) {
  return (
    <div>
      <div className="  grid grid-cols-3 items-center ">
        <div className="flex flex-col gap-1 justify-between items-start">
          <h1 className=" flex items-center justify-center text-2xl font-semibold leading-none ml-2">{title}</h1>
           <p className="text-sm text-muted-foreground ml-4">-{subtitle}</p>
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  )
}
