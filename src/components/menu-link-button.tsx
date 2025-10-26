import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button';

interface MenuLinkButtonProps {
    children: React.ReactNode;
    href: string;

}

export default function MenuLinkButton({ children, href, }: MenuLinkButtonProps) {
    return (
        <div className="flex items-center font-medium my-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
            <Link href={href} className="flex-1">
                {children}
            </Link>
        </div>

    )
}
