"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface MenuLinkButtonProps {
  children: React.ReactNode;
  href: string;
}

export default function MenuLinkButton({ children, href }: MenuLinkButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div
      className={`flex items-center font-medium my-2 px-2 py-1 rounded-md transition-colors
        ${
          isActive
            ? "bg-gray-900/30"
            : "hover:bg-muted/80"
        }`}
    >
      <Link href={href} className="flex-1">
        {children}
      </Link>
    </div>
  );
}
