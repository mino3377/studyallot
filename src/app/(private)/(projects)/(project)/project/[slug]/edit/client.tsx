// C:\Users\chiso\nextjs\study-allot\src\app\(private)\(projects)\(project)\project\[slug]\edit\client.tsx
"use client"

import { useState, FormEvent, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProjectBasicInfoCard from "@/components/projects/ProjectBasicInfoCard"

type Props = {
  initial: {
    slug: string
    name: string
    goal: string
    notes?: string
  }
  onSubmit: (fd: FormData) => Promise<{ ok: boolean; message?: string } | void>
}

export default function EditProjectForm({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial.name)
  const [goal, setGoal] = useState(initial.goal)
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
      if (res && "ok" in res && !res.ok) {
        setError(res.message ?? "更新に失敗しました。")
      }
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
        <Button asChild variant="ghost">
          <Link href={`/project/${initial.slug}`}>キャンセル</Link>
        </Button>
        <Button type="submit" className="px-6" disabled={isPending}>
          {isPending ? "更新中…" : "更新する"}
        </Button>
      </div>
    </form>
  )
}
