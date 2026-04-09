// src/app/(public)/page.tsx
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MotionDiv, MotionSection } from "@/components/Animate"
import {
  BookOpen,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { redirect } from "next/navigation"
import studyallot2 from "@/components/image/studyallot2.png"
import studyallot4 from "@/components/image/studyallot4.png"

export default async function Landing() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/dashboard")

  return (
    <main className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(800px 400px at 50% -10%, hsl(var(--primary)/.25), transparent 60%), radial-gradient(600px 300px at 20% 10%, hsl(var(--muted-foreground)/.25), transparent 60%)",
        }}
      />

      {/* hero */}
      <MotionSection className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-36">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-0">
          <div className="flex flex-col items-center justify-center space-y-6 md:items-start">
            <h1 className="text-center text-4xl font-bold leading-tight tracking-tight md:text-left md:text-5xl">
              一元管理で
              <br />
              今日やるべきが見える
            </h1>

            <p className="text-center text-base text-muted-foreground md:text-left md:text-lg">
              複数の教材をまとめて管理し、
              <br />
              逆算して学習計画を組み立て。
              <br />
              全体を把握し、迷いをなくします。
            </p>
          </div>

          <MotionDiv className="relative">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={studyallot2}
                alt="studyallot ダッシュボード"
                width={1080}
                height={720}
                className="h-auto w-full"
                priority
              />
            </div>
          </MotionDiv>
        </div>
      </MotionSection>

      <Separator className="mx-auto max-w-6xl" />

      {/* feature cards */}
      <MotionSection
        id="features"
        className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-36"
      >
        <div className="mb-10 space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            StudyAllot でできること
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<BookOpen className="size-5" />}
            title="複数の教材を一元管理"
            desc="教材をプロジェクトごとに管理し、複数の統計データによって進行具合を把握できます。"
          />
          <FeatureCard
            icon={<CalendarDays className="size-5" />}
            title="逆算した学習計画の作成"
            desc="教材ごとに期間を決めて、逆算してその日にやるべきタスクを割り振ります。"
          />
          <FeatureCard
            icon={<TrendingUp className="size-5" />}
            title="実用的で多様な統計データ"
            desc="教材ごとの進捗率、遅れ具合、毎日の学習時間推移などを可視化し、モチベーションを向上させます。"
          />
        </div>
      </MotionSection>

      <Separator className="mx-auto max-w-6xl" />

      {/* target users */}
      <MotionSection className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            こんな学習に向いています
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <AudienceCard
            title="資格試験の勉強"
            items={[
              "試験日から逆算して計画を作成",
              "複数教材をまとめて進捗管理",
              "日ごとのタスク量を見える化",
            ]}
          />
          <AudienceCard
            title="大学受験の学習管理"
            items={[
              "科目ごとに教材を整理",
              "レポートや試験対策を並行管理",
              "学習の偏りを防ぎやすい",
            ]}
          />
          <AudienceCard
            title="複数分野の継続学習"
            items={[
              "英語・統計・プログラミングなどを一元化",
              "毎日やるべき内容を自動で確認",
              "長期の継続でも全体像を保ちやすい",
            ]}
          />
        </div>
      </MotionSection>

      <Separator className="mx-auto max-w-6xl" />

      {/* devices */}
      <MotionSection className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            PC・タブレット・スマホでも見やすく
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            自宅では広く、外では手軽に。デバイスごとに使いやすい設計。
          </p>
        </div>
        <MotionDiv className="relative">
          <div className="overflow-hidden rounded-2xl flex justify-center">
            <Image
              src={studyallot4}
              alt="studyallot 複数デバイス"
              width={1000}
              

              priority
            />
          </div>
        </MotionDiv>
      </MotionSection>

      <Separator className="mx-auto max-w-6xl" />

      {/* closing */}
      <MotionSection className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <Card className="border bg-card/70">
          <CardContent className="flex flex-col items-center gap-5 p-8 text-center md:p-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              迷わずに、着実に進める学習を
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              複数の教材、限られた時間、見えにくい進捗。
              それらをまとめて整理し、今日やるべきことを明確にするための学習管理ツールです。
            </p>
          </CardContent>
        </Card>
      </MotionSection>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg border p-2">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {desc.split("。").filter(Boolean).map((s, i) => (
            <span key={i}>
              {s}。
              {i !== desc.split("。").filter(Boolean).length - 1 && <br />}
            </span>
          ))}
        </p>
      </CardContent>
    </Card>
  )
}

function LargeVisualCard({
  badge,
  title,
  desc,
  children,
}: {
  badge: string
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="space-y-5 p-5 md:p-6">
        <Badge variant="secondary">{badge}</Badge>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function AudienceCard({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}