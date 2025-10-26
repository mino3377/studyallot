import React from 'react'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link';

export default function AddButton({ text, href, title }: { text: string; href: string; title: string }) {
    return (
        <div className='mb-4 flex items-center justify-between'>
            <div className='font-bold text-xl'>
                {title}
            </div>
            <Button
                asChild
                className="rounded-xl hover:bg-stone-200"
                variant="secondary"
                aria-label={text}
            >
                <Link href={href} className="flex items-center">
                    <Plus className="mr-1" />
                    {text}
                </Link>
            </Button>
        </div>

    )
}
