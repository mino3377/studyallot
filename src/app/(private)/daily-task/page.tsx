// src/app/(private)/daily-task/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PageBody from "./page-body";
import { getDailyTaskData } from "./data";
import { getTodayISOForUser } from "@/lib/user-tz";

function addDaysZoned(baseISO: string, days: number, tz: string): string {
  const d = new Date(`${baseISO}T12:00:00`);
  d.setUTCDate(d.getUTCDate() + days);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const p = fmt.formatToParts(d);
  const y = p.find(x => x.type === "year")?.value ?? "1970";
  const m = p.find(x => x.type === "month")?.value ?? "01";
  const da = p.find(x => x.type === "day")?.value ?? "01";
  return `${y}-${m}-${da}`;
}

function dayOfWeekInTZ(iso: string, tz: string): number {
  const d = new Date(`${iso}T00:00:00`);
  const wd = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tz }).format(d);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

function startOfWeekMondayISO(todayISO: string, tz: string): string {
  const dow = dayOfWeekInTZ(todayISO, tz); 
  const offsetFromMon = (dow + 6) % 7;
  return addDaysZoned(todayISO, -offsetFromMon, tz);
}

export default async function DailyTaskPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");

  const { tz, todayISO } = await getTodayISOForUser(auth.user.id);
  const weekStartISO = startOfWeekMondayISO(todayISO, tz);

  const dataPromise = getDailyTaskData(auth.user.id, weekStartISO, tz);
  return <PageBody dataPromise={dataPromise} todayISO={todayISO} />;
}
