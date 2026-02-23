//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-project\page-body.tsx

"use client"

import { useState, FormEvent, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProjectBasicInfoCard from "@/components/projects/ProjectBasicInfoCard"

type Props = { 
  onSubmit: (fd: FormData) => Promise<{ ok: boolean; message?: string } | void> 
}

export default function AddProjectForm({ onSubmit }: Props) {
  const [name, setName] = useState("")
  const [goal, setGoal] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set("name", name)
    fd.set("goal", goal)

    startTransition(async () => {
      const res = await onSubmit(fd)
      if (res && "ok" in res && !res.ok) setError(res.message ?? "作成に失敗しました。")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProjectBasicInfoCard
        name={name}
        onChangeName={setName}
        goal={goal}
        onChangeGoal={setGoal}
      />

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost"><Link href="/project">キャンセル</Link></Button>
        <Button type="submit" className="px-6" disabled={isPending}>
          {isPending ? "作成中…" : "作成する"}
        </Button>
      </div>
    </form>
  )
}
