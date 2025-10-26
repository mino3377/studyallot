"use client";

import React from "react";

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    as?: "a" | "button";
    href?: string;
};

export default function AddButton({ children, onClick, type = "button", as, href }: ButtonProps) {


    return (as === "a" && href) ? (<a
        className="AddButton"
        href={href}
    >
        {children}
    </a>)
        : (<button
            className="AddButton"
            type={type}
            onClick={onClick}>
            {children}
        </button>)
}