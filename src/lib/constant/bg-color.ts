// src/lib/constant/bg-color.ts

export const themeColorMap = {
    stone: {
        base: "bg-stone-300",
        panel: "bg-stone-200",
        border: "border-stone-400",
        text: "text-black",
        mutedText: "text-black/45",
    },
    blue: {
        base: "bg-blue-100",
        panel: "bg-blue-200",
        border: "border-blue-300",
        text: "text-blue-950",
        mutedText: "text-blue-950/50",
    },
} as const

export type ThemeColorKey = keyof typeof themeColorMap

export function getThemeColor(theme: string) {
    return themeColorMap[theme as ThemeColorKey] ?? themeColorMap.stone
}