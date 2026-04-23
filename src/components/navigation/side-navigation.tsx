"use client"

import { ChartColumnBig, LayoutDashboard, LibraryBig, Pen, SendToBack } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const nameconverterRow = [
    { title: "Dashboard", pathname: "/dashboard" },
    { title: "Editor", pathname: "/material-editor" },
    { title: "Order", pathname: "/order" },
    { title: "Overview", pathname: "/overview" },
    { title: "Statistics", pathname: "/statistics" },
]

function isSelected(name: string, pathname?: string) {
    if (!pathname) return
    let title = ""
    const find = nameconverterRow.find((object) => {
        if (!(pathname === object.pathname)) return
        return object
    })
    if (!find) return
    title = find.title
    const result = title === name ? true : false

    return result
}

function NavIconAndText({
    children,
    name,
    pathname,
    href
}: {
    children: React.ReactNode,
    pathname?: string
    name: string,
    href?: string

}) {
    const result = isSelected(name, pathname)

    return (
        <>
            {href ?
                <Link
                    href={href}
                    className={`flex-col text-xs font-serif  flex items-center justify-center transition`}
                >
                    {children}

                    <div className={` ${result ? "text-white dark:text-black/20" : "text-white/70 dark:text-black/70"}`}>
                        {name}
                    </div>

                </Link>
                :
                <div

                    className={`flex-col text-xs font-serif  flex items-center justify-center transition`}
                >
                    {children}

                    <div className={` ${result ? "text-white dark:text-black/20" : "text-white/70 dark:text-black/70"}`}>
                        {name}
                    </div>

                </div>}


        </>

    )
}

function NavIcon({
    pathname,
    children,
    name
}: {
    children: React.ReactNode
    pathname?: string,
    name: string
}) {

    const result = isSelected(name, pathname)

    return (
        <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg p-2 transition dark:hover:bg-muted/10 hover:bg-white/50 ${result ? "text-white  dark:text-black/20 " : "text-white/70 dark:text-black/70"}`}
        >
            {children}

        </div>
    )
}


export function SideNav() {
    const pathname = usePathname()

    return (
        <div
            className="
             fixed bottom-4 left-1/2 z-50 -translate-x-1/2
             flex flex-row items-center gap-3
             rounded-2xl border border-white/20 bg-black/80 px-3 py-2
             shadow-lg backdrop-blur-md

             lg:static lg:left-auto lg:bottom-auto lg:z-auto lg:translate-x-0
             lg:flex lg:w-12 lg:mt-12 lg:items-center lg:pl-1 lg:pt-5 lg:space-y-3 lg:flex-col lg:mx-3
             lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none
            "
        >
            <NavIconAndText name={nameconverterRow[0].title} href={`${nameconverterRow[0].pathname}`} pathname={pathname}>
                <NavIcon name={nameconverterRow[0].title} pathname={pathname}>
                    <LayoutDashboard className="h-5 w-5" />
                </NavIcon>
            </NavIconAndText>

            <NavIconAndText name={nameconverterRow[1].title} href={`${nameconverterRow[1].pathname}`} pathname={pathname}>
                <NavIcon name={nameconverterRow[1].title} pathname={pathname}>
                    <Pen className="h-5 w-5" />
                </NavIcon>
            </NavIconAndText>



            <NavIconAndText name={nameconverterRow[2].title} href={`${nameconverterRow[2].pathname}`} pathname={pathname}>
                <NavIcon name={nameconverterRow[2].title} pathname={pathname}>
                    <SendToBack className="h-5 w-5" />
                </NavIcon>
            </NavIconAndText>

            <NavIconAndText name={nameconverterRow[3].title} href={`${nameconverterRow[3].pathname}`} pathname={pathname}>
                <NavIcon name={nameconverterRow[3].title} pathname={pathname}>
                    <LibraryBig className="h-5 w-5" />
                </NavIcon>
            </NavIconAndText>

            <NavIconAndText name={nameconverterRow[4].title} pathname={pathname}>
                <NavIcon name={nameconverterRow[4].title} pathname={pathname}>
                    <ChartColumnBig className="h-5 w-5" />
                </NavIcon>
            </NavIconAndText>


        </div>
    )
}