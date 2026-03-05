// C:\Users\chiso\nextjs\study-allot\src\app\(private)\new-add\_components\new-add-primary\new-add-step-nav.tsx

type Step = 1 | 2

export default function NewAddStepNav({
  current,
  onChange,
}: {
  current: Step
  onChange: (step: Step) => void
}) {
  const items: Array<{ step: Step; title: string }> = [
    { step: 1, title: "プロジェクト選択" },
    { step: 2, title: "教材登録" },
  ]

  return (
    <nav aria-label="新規追加ステップ" className="w-full">
      <div className="rounded-md">
        <ol className="flex">
          {items.map((it, idx) => {
            const isActive = it.step === current
            const isDone = it.step < current
            const isLast = idx === items.length - 1

            const dotSize = isActive ? "h-7 w-7" : "h-6 w-6"

            return (
              <li
                key={it.step}
                className={[
                  "relative flex flex-1 justify-center",
                  isActive ? "opacity-100" : isDone ? "opacity-80" : "opacity-45",
                ].join(" ")}
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className={[
                      "absolute h-px bg-border",
                      "left-[calc(50%+14px)] top-[22px] w-[calc(100%-28px)]",
                    ].join(" ")}
                  />
                )}

                <button
                  type="button"
                  onClick={() => onChange(it.step)}
                  className="grid grid-rows-[auto_auto] justify-items-center gap-2 outline-none"
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`ステップ${it.step}へ`}
                >
                  <div
                    className={[
                      "relative z-10 flex items-center justify-center rounded-full border text-xs font-semibold bg-background",
                      dotSize,
                      isActive
                        ? "border-foreground/60"
                        : isDone
                          ? "border-foreground/35"
                          : "border-foreground/25",
                    ].join(" ")}
                  >
                    {it.step }
                  </div>

                  <div
                    className={[
                      "text-center transition-all text-md",
                      isActive
                        ? "text-base font-bold"
                        : "text-sm font-semibold text-muted-foreground",
                    ].join(" ")}
                  >
                    {it.title}
                  </div>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export type { Step }