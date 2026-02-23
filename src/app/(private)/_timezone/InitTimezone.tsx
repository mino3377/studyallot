// src/app/(private)/_components/InitTimezone.tsx
'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { captureClientTZOnce } from '@/app/(private)/_timezone/profile'

export default function InitTimezone() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    ;(async () => {
      const res = await captureClientTZOnce(tz)
      if (res?.ok && res?.wrote) router.refresh()
    })()
  }, [pathname])

  return null
}
