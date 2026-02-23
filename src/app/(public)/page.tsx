// src/app/(public)/page.tsx  (Server Component)
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MotionDiv, MotionSection } from "@/components/Animate"
import { BookOpen, CalendarDays,TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"
import studyallot1 from "@/components/image/studyallot1.png"

export default async function Landing() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/daily-task")

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

      <MotionSection className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-36">
        <div className="grid md:grid-cols-2 gap-8 md:gap-0 items-center">
          <div className="flex flex-col items-center md:items-start justify-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-center md:text-left">
              一元管理で<br />
              今日やるべきが見える
            </h1>

            <p className="text-base md:text-lg text-muted-foreground text-center md:text-left">
              複数の教材をまとめて管理し、<br />
              逆算して学習計画を組み立て。<br />
              全体を把握し、迷いをなくします。
            </p>
          </div>

          <MotionDiv className="relative">
            <div className="rounded-2xl  overflow-hidden">
              <Image
                src={studyallot1}
                alt="studyallot ダッシュボード"
                width={1080}
                height={720}
                className="w-full h-auto"
                priority
              />
            </div>
          </MotionDiv>
        </div>
      </MotionSection>

      <Separator className="mx-auto max-w-6xl" />

      <MotionSection id="features" className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-36">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">studyallot でできること</h2>
          <p className="text-muted-foreground">
            教材管理・全体スケジュール・日々の記録を、ひとつの画面群に。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="size-5" />}
            title="教材×セクション×周回を一元管理"
            desc="セクション数に加えて周回数も設定。目標までの反復学習を計画できます。"
          />
          <FeatureCard
            icon={<CalendarDays className="size-5" />}
            title="ガントチャートで全体を見渡す(PC版)"
            desc="「いつ・どの教材を進めるか」を期間全体のグラフで可視化。目標まで迷いをなくします。"
          />
          <FeatureCard
            icon={<TrendingUp className="size-5" />}
            title="デイリータスクと実績ログ"
            desc="今日やるべき課題を一覧表示。ワンタップで完了を記録し、計画と実績のズレを把握できます。"
          />
        </div>
      </MotionSection>

      {/* 使い方 */}
      <MotionSection id="how-it-works" className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-36">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">導入は 3 ステップ</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            step="01"
            title="プロジェクトを作成"
            desc="どの教材を、このプロジェクトで管理するのかを決めます。"
          />
          <StepCard
            step="02"
            title="教材を作成"
            desc="期間、セクション、周回数などを入力します。"
          />
          <StepCard
            step="03"
            title="デイリータスクを確認して記録"
            desc="今日やることを確認し、終わったらワンタップで記録。"
          />
        </div>
      </MotionSection>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="h-full">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg border p-2">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
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
function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <Card className="border bg-card/80 hover:shadow-lg transition-shadow">
      <CardHeader className="p-6 pb-3 space-y-2">
        <Badge variant="secondary" className="w-fit">STEP {step}</Badge>
        <CardTitle className="leading-tight">{title}</CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
        {desc.split("。").filter(Boolean).map((s, i, arr) => (
          <span key={i}>
            {s}。
            {i !== arr.length - 1 && <br />}
          </span>
        ))}
      </CardContent>
    </Card>
  )
}
