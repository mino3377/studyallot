"use client"

import { JSX, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MonitorUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  parseISODate, minMax, monthsBetween, daysBetween,
  monthMM, dayDD, todayLocalISO, fmtISO,
} from "@/lib/gantt-date"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GanttItem, ViewMode } from "@/lib/type/dashboard"

const COLW = { year: 56, month: 28 }
const ROW_H = 64
const HEADER_H = 44
const LABEL_W = 240

// チャートの期間（教材の最小開始〜最大終了を厳密に）
function clampExactRange(mode: ViewMode, items: GanttItem[]) {
  const starts = items.map(i => parseISODate(i.start))
  const ends = items.map(i => parseISODate(i.end))
  const { min, max } = minMax([...starts, ...ends])
  if (!min || !max) return null
  if (mode === "year") {
    return {
      start: new Date(min.getFullYear(), min.getMonth(), 1),
      end: new Date(max.getFullYear(), max.getMonth() + 1, 0),
    }
  }
  return {
    start: new Date(min.getFullYear(), min.getMonth(), min.getDate()),
    end: new Date(max.getFullYear(), max.getMonth(), max.getDate()),
  }
}

function buildColumns(mode: ViewMode, start: Date, end: Date) {
  return mode === "year" ? monthsBetween(start, end) : daysBetween(start, end)
}

function useAutoScroll(columns: Date[], mode: ViewMode, colW: number, scrollEl: HTMLDivElement | null) {
  const todayISO = todayLocalISO()
  const todayIndex = useMemo(() => {
    if (!columns.length) return 0
    const t = parseISODate(todayISO)!
    if (mode === "year") {
      const key = new Date(t.getFullYear(), t.getMonth(), 1).getTime()
      const idx = columns.findIndex(d => new Date(d.getFullYear(), d.getMonth(), 1).getTime() === key)
      return idx >= 0 ? idx : 0
    }
    const key = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()
    let idx = columns.findIndex(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === key)
    if (idx < 0) idx = (t < columns[0] ? 0 : columns.length - 1)
    return idx
  }, [columns, mode, todayISO])

  useEffect(() => {
    if (!scrollEl) return
    scrollEl.scrollTo({ left: Math.max(0, todayIndex * colW - 16), behavior: "auto" as ScrollBehavior })
  }, [scrollEl, todayIndex, colW])

  return { todayISO }
}

/** 右側：グリッド（セルで罫線を描く）＋矢印 */
function RightGrid({
  items, columns, mode, colWidth, rowHeight, todayISO
}: {
  items: GanttItem[]
  columns: Date[]
  mode: ViewMode
  colWidth: number
  rowHeight: number
  todayISO: string
}) {
  const width = columns.length * colWidth
  const height = items.length * rowHeight

  // 列インデックス取得ヘルパ
  const toKey = (d: Date) =>
    mode === "year"
      ? new Date(d.getFullYear(), d.getMonth(), 1).getTime()
      : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const idxOf = (d: Date) => {
    const key = toKey(d)
    return columns.findIndex(x => toKey(x) === key)
  }

  const ARROW_H = 8
  const LINE_THICK = 2

  // 今日の列（なければ -1）
  const todayIdx = useMemo(() => {
  const t = parseISODate(todayISO)
  if (!t) return -1
  return idxOf(t)
}, [todayISO, columns, idxOf])


  // グリッドセルを生成（右罫線 + 下罫線のみ。上罫線は別で1本引く）
  function CellsGrid() {
    const cells: JSX.Element[] = []
    for (let r = 0; r < items.length; r++) {
      for (let c = 0; c < columns.length; c++) {
        const key = `cell-${r}-${c}`
        const left = c * colWidth
        const top = r * rowHeight
        const isToday = c === todayIdx
        cells.push(
          <div
            key={key}
            className={cn(
              "absolute border-r border-b",
              isToday ? "bg-primary/5" : ""
            )}
            style={{
              left,
              top,
              width: colWidth,
              height: rowHeight,
              borderColor: "hsl(var(--border))",
            }}
            title={fmtISO(columns[c])}
          />
        )
      }
    }
    return <>{cells}</>
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* 上端の横線（ヘッダー直下） */}
      <div
        className="absolute left-0 right-0 border-t"
        style={{ top: 0, borderColor: "hsl(var(--border))" }}
      />

      {/* グリッド（セル単位で border を描く） */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <CellsGrid />
      </div>

      {/* 矢印（セルの上のレイヤに重ねる） */}
      <div className="absolute inset-0 z-20">
        {items.map((it, r) => {
          if (!it.start || !it.end) return null
          const s = parseISODate(it.start)!; const e = parseISODate(it.end)!
          let sc = idxOf(s); if (sc < 0) sc = 0
          let ec = idxOf(e); if (ec < 0) ec = columns.length - 1

          const left = sc * colWidth
          const rightEdge = (ec + 1) * colWidth
          const y = r * rowHeight + rowHeight / 2

          const arrowHeadW = 10
          const lineLeft = left
          const lineRight = Math.max(lineLeft + 4, rightEdge - arrowHeadW)
          const lineW = lineRight - lineLeft

          return (
            <div key={`arrow-${it.id}`} className="absolute text-primary">
              {/* 横線 */}
              <div
                className="absolute bg-current"
                style={{ left: lineLeft, top: y - LINE_THICK / 2, width: lineW, height: LINE_THICK }}
                title={`${fmtISO(s)} — ${fmtISO(e)}`}
              />
              {/* 矢じり */}
              <div
                className="absolute"
                style={{
                  left: lineRight, top: y - ARROW_H, width: 0, height: 0,
                  borderTop: `${ARROW_H}px solid transparent`,
                  borderBottom: `${ARROW_H}px solid transparent`,
                  borderLeft: `${arrowHeadW}px solid currentColor`,
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GanttSurface({
  items, mode, colWidth, rowHeight,
  fullscreen = false, fixedRows = 5, className, style,
}: {
  items: GanttItem[]; mode: ViewMode; colWidth: number; rowHeight: number;
  fullscreen?: boolean; fixedRows?: number; className?: string; style?: React.CSSProperties;
}) {
  const exact = useMemo(() => clampExactRange(mode, items), [mode, items])

  // ★ 条件分岐の前に必ず Hooks を呼ぶ
  const columns = useMemo(
    () => (exact ? buildColumns(mode, exact.start, exact.end) : []),
    [mode, exact]
  )
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { todayISO } = useAutoScroll(columns, mode, colWidth, scrollRef.current)

  const paddedItems = useMemo(() => {
    if (fullscreen) return items
    const need = Math.max(0, (fixedRows ?? 5) - items.length)
    if (need === 0) return items
    const blanks: GanttItem[] = Array.from({ length: need }).map((_, i) => ({
      id: Number.MAX_SAFE_INTEGER - i, title: "", start: "", end: "", projectSlug: "", projectName: "",
    }))
    return [...items, ...blanks]
  }, [items, fullscreen, fixedRows])

  // ★ ここで早期 return
  if (!exact) {
    return <div className={cn("w-full rounded-md border p-6 text-sm text-muted-foreground", className)} style={style}>
      計画（開始/終了日）が設定された教材がありません。
    </div>
  }

  const visibleRows = fullscreen ? items.length : Math.max(items.length, fixedRows ?? 5)
  const rightWidth = columns.length * colWidth

  return (
    <div
      ref={scrollRef}
      className={cn("relative w-full overflow-x-auto overflow-y-auto rounded-md border",
        fullscreen ? "h-full" : "max-h-[80vh]")}
      style={style}
    >
      {/* ヘッダー */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex border-b">
          {/* 左ヘッダー */}
          <div
            className="shrink-0 sticky left-0 z-40 bg-background/90 border-r flex items-center px-3 text-xs font-medium text-muted-foreground"
            style={{ width: LABEL_W, height: HEADER_H }}
          >
            教材
          </div>
          {/* 右ヘッダー（rightWidth にぴったり） */}
          <div className="relative" style={{ width: rightWidth, height: HEADER_H }}>
            <div className="absolute left-0 bottom-0 border-b border-border" style={{ width: rightWidth }} />
            {columns.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "absolute top-0 bottom-0 border-l border-border flex items-center justify-center text-xs",
                  fmtISO(d) === todayISO ? "bg-primary/10 font-semibold" : "bg-card"
                )}
                style={{ left: i * colWidth, width: colWidth }}
                title={fmtISO(d)}
              >
                {mode === "year" ? monthMM(d) : dayDD(d)}
              </div>
            ))}
            <div className="absolute top-0 bottom-0 border-l border-border" style={{ left: rightWidth, width: 0 }} />
          </div>
        </div>
      </div>

      {/* ボディ */}
      <div className="relative flex" style={{ height: `calc(${visibleRows} * ${rowHeight}px)` }}>
        {/* 左：ラベル列（sticky） */}
        <div
          className="shrink-0 sticky left-0 z-50 bg-background/90 border-r"
          style={{ width: LABEL_W, height: "100%" }}
        >
          {paddedItems.map((it) => (
            <div
              key={`label-${it.id}`}
              className="flex items-center px-3 border-b"
              style={{ height: rowHeight }}
              title={it.title ? `${it.title}（${it.projectName || it.projectSlug}）` : undefined}
            >
              <div className="truncate leading-5">
                <div className="text-sm font-medium">{it.title || "\u00A0"}</div>
                <div className="text-[11px] text-muted-foreground">
                  {it.title ? (it.projectName) : "\u00A0"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 右：完全なグリッド＋矢印 */}
        <div className="relative" style={{ width: columns.length * colWidth, height: "100%" }}>
          <RightGrid
            items={paddedItems}
            columns={columns}
            mode={mode}
            colWidth={colWidth}
            rowHeight={rowHeight}
            todayISO={todayISO}
          />
        </div>
      </div>
    </div>
  )
}

export default function ManualGantt({
  items, filterProjectSlug, defaultMode = "year",
}: {
  items: GanttItem[]; filterProjectSlug?: string; defaultMode?: ViewMode
}) {
  const [mode, setMode] = useState<ViewMode>(defaultMode)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!filterProjectSlug || filterProjectSlug === "all") return items
    return items.filter(i => i.projectSlug === filterProjectSlug)
  }, [items, filterProjectSlug])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as ViewMode)}>
          <ToggleGroupItem value="year" aria-label="年表示">年</ToggleGroupItem>
          <ToggleGroupItem value="month" aria-label="月表示">月</ToggleGroupItem>
        </ToggleGroup>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" title="全画面で表示">
              <MonitorUp className="h-4 w-4 mr-2" /> 全画面
            </Button>
          </DialogTrigger>

          <DialogContent className="p-0 m-0 max-w-[100vw] w-[100vw] h-[100vh] sm:max-w-[100vw] overflow-hidden">
            <DialogHeader className="px-4 py-2 border-b">
              <DialogTitle className="text-base">ガントチャート（全画面）</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[calc(100vh-44px)] p-2 overflow-hidden">
              <GanttSurface
                items={filtered}
                mode={mode}
                colWidth={mode === "year" ? COLW.year : COLW.month}
                rowHeight={ROW_H}
                fullscreen
                className="h-full"
                style={{ height: "100%" }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <GanttSurface
        items={filtered}
        mode={mode}
        colWidth={mode === "year" ? COLW.year : COLW.month}
        rowHeight={ROW_H}
        fixedRows={5}
      />
    </div>
  )
}
