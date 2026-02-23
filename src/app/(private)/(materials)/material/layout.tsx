//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\material\layout.tsx


import SubHeader from '@/components/sub-header/sub-header'
import React, { ReactNode } from 'react'

export default function MaterialLayout({ children }: { children: ReactNode }) {
    return (
         <section className="w-full px-4 lg:px-6 py-6">
            <SubHeader title={'教材'} />
            <main className="">{children}</main>
        </section>
    )
}
