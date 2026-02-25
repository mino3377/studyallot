import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link';

export default function AddButton({ text, href }: { text: string; href: string;}) {
    return (
            <Button
                asChild
                className="rounded-xl hover:bg-stone-200"
                variant="secondary"
                aria-label={text}
            >
                <Link href={href} className="flex items-center">
                    <Plus className="sm:mr-1" />
                    <div className='hidden sm:flex'>
                        {text}
                    </div>
                </Link>
            </Button>

    )
}
