//C:\Users\chiso\nextjs\study-allot\src\app\(private)\(materials)\material\layout.tsx

import SubHeader from '@/components/sub-header'
import React, { ReactNode } from 'react'

export default function MaterialLayout({ children }: { children: ReactNode }) {
    return (
         <section className="w-full px-4 md:px-6 py-6">
            <SubHeader title={'マテリアル'} />
            <main className="">{children}</main>
        </section>
    )
}
