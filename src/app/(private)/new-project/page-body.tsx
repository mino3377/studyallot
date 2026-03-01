//C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-project\page-body.tsx

"use client"

import { useState, FormEvent, useTransition } from "react"

type Props = {
  onSubmit: (fd: FormData) => Promise<{ ok: boolean; message?: string } | void>
}

export default function AddProjectForm({ onSubmit }: Props) {
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set("name", name)

    startTransition(async () => {
      const res = await onSubmit(fd)
      if (res && "ok" in res && !res.ok) setError(res.message ?? "作成に失敗しました。")
    })
  }

  return (
    <form className="space-y-6">
      こんにちは
    </form>
  )
}
