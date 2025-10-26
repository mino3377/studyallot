//C:\Users\chiso\nextjs\study-allot\src\components\header.tsx

import React from 'react'
import MenuSheetServer from './menu-sheet-server'
import { Button } from './ui/button'
import Link from 'next/link'

export default function Header() {
    return (
        <header className='w-full fixed bg-background h-16 top-0 left-0'>
            <div className='flex items-center mx-auto bg-amber-600 px-2 h-full justify-between'>
                <div className='md:hidden'>
                    <MenuSheetServer />
                </div>
                <Button className='backdrop-blur-md bg-amber-600 hover:bg-emerald-400 transition-colors' >
                    <Link href={"/"}>
                        <div>studyallot</div>
                    </Link>
                </Button>
            </div>
        </header>
    )
}
