// src/app/(public)/page.tsx  (Server Component)
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MotionDiv, MotionSection } from "@/components/Animate"
import { BookOpen, CalendarDays, CheckCircle2, Clock, Sparkles, TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"

export default async function Landing() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <main className="relative">
      {/* 背景の柔らかいグラデーション */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(800px 400px at 50% -10%, hsl(var(--primary)/.25), transparent 60%), radial-gradient(600px 300px at 20% 10%, hsl(var(--muted-foreground)/.25), transparent 60%)",
        }}
      />

      {/* HERO */}
      <MotionSection className="mx-auto max-w-6xl px-4 md:px-6 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-3 py-1 w-fit">
              新しい学習体験を、日割りで
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              「今日やること」が自動で決まる。<br className="hidden md:block" />
              学習を<strong className="font-extrabold">止めない</strong>スケジューラー。
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              StudyAllotは、教材・章・周回から最適な<strong>日割り計画</strong>を生成。
              タイムゾーンずれや端数処理も吸収し、<strong>今日のタスク</strong>を一目で提示します。
            </p>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <Button asChild size="lg"><Link href="/app">アプリを開く</Link></Button>
              ) : (
                <>
                  <Button asChild size="lg"><Link href="/signup">無料で始める</Link></Button>
                  <Button asChild size="lg" variant="outline"><Link href="/login">ログイン</Link></Button>
                </>
              )}
              <Button asChild variant="ghost">
                <Link href="#screens" className="flex items-center gap-2">
                  <Sparkles className="size-4" /> 1分で見る
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2"><CheckCircle2 className="size-4" /> TZずれ吸収ロジック</div>
              <div className="flex items-center gap-2"><TrendingUp className="size-4" /> 進捗可視化 / 日別集計</div>
              <div className="flex items-center gap-2"><Clock className="size-4" /> 1分で初期設定</div>
            </div>
          </div>

          {/* 右：ヒーロービジュアル */}
          <MotionDiv className="relative">
            <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
              <Image
                src="/landing/dashboard.png"
                alt="StudyAllot ダッシュボード"
                width={1080}
                height={720}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <Card className="rounded-xl shadow-lg">
                <CardContent className="p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    <span className="font-medium">今日のタスク</span>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    「セクション5, 6」を完了で＋12%前進
                  </div>
                </CardContent>
              </Card>
            </div>
          </MotionDiv>
        </div>
      </MotionSection>

      <Separator className="mx-auto max-w-6xl" />

      {/* 特徴 */}
      <MotionSection id="features" className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-20">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">StudyAllot の3つの柱</h2>
          <p className="text-muted-foreground">“続けられる”に必要な要素を、シンプルに。</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="size-5" />}
            title="教材×章×周回の一元管理"
            desc="教材と章を登録し、周回数を設定するだけ。余計な設定は不要。"
          />
          <FeatureCard
            icon={<CalendarDays className="size-5" />}
            title="自動日割り & 今日のタスク提示"
            desc="期間と合計量から端数をうまく配分。毎朝“やること”が並ぶ。"
          />
          <FeatureCard
            icon={<TrendingUp className="size-5" />}
            title="進捗の即時反映と可視化"
            desc="完了は1タップ。ダッシュボードに即反映され、やる気が続く。"
          />
        </div>
      </MotionSection>

      {/* 使い方 */}
      <MotionSection id="how-it-works" className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-20">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">はじめかたは 3 ステップ</h2>
          <p className="text-muted-foreground">最短1分。今日の学習から変わる。</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StepCard step="01" title="教材を登録" desc="科目・教材・章（セクション）・周回数を設定。" />
          <StepCard step="02" title="期間を決める" desc="開始・終了日を入力。TZを意識せずOK。" />
          <StepCard step="03" title="今日のタスクを実行" desc="提示された“やること”をチェックで完了。" />
        </div>
      </MotionSection>

      {/* スクリーン / デモ */}
      <MotionSection id="screens" className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-20">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">スクリーン</h2>
          <p className="text-muted-foreground">主要画面のイメージ（差し替え推奨）。</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ScreenCard title="ダッシュボード" src="/landing/dashboard.png" alt="ダッシュボード" />
          <ScreenCard title="日次タスク" src="/landing/daily.png" alt="日次タスク" />
          <ScreenCard title="教材管理" src="/landing/materials.png" alt="教材管理" />
        </div>

        <div className="text-center mt-10">
          {user ? (
            <Button asChild size="lg"><Link href="/app">今すぐ使う</Link></Button>
          ) : (
            <div className="flex gap-3 justify-center">
              <Button asChild size="lg"><Link href="/signup">無料で始める</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/login">ログイン</Link></Button>
            </div>
          )}
        </div>
      </MotionSection>

      {/* FAQ */}
      <MotionSection id="faq" className="mx-auto max-w-3xl px-4 md:px-6 py-14 md:py-20">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">よくある質問</h2>
          <p className="text-muted-foreground">導入前の不安を解消します。</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="a1">
            <AccordionTrigger>本当に毎日やる範囲が自動で出ますか？</AccordionTrigger>
            <AccordionContent>
              はい。合計量と期間から端数配分を行い、TZずれも考慮した日割りを提示します。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a2">
            <AccordionTrigger>途中でプラン変更しても大丈夫？</AccordionTrigger>
            <AccordionContent>
              変更後に再配分を実行し、今日以降の割り当てを再計算します。過去の記録はそのままです。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a3">
            <AccordionTrigger>スマホでも見やすいですか？</AccordionTrigger>
            <AccordionContent>
              モバイル幅（~375px）を基準に最適化しています。指でのタップ操作も配慮しています。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </MotionSection>
    </main>
  )
}

/* ------- Serverから呼べる小UI ------- */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="border bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-center gap-3 pb-2">
        <div className="rounded-md p-2 border bg-muted/40">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
    </Card>
  )
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <Card className="border bg-card/80 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <Badge variant="secondary" className="w-fit">STEP {step}</Badge>
        <CardTitle className="mt-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
    </Card>
  )
}

function ScreenCard({ title, src, alt }: { title: string; src: string; alt: string }) {
  return (
    <Card className="overflow-hidden border bg-card/80 hover:shadow-xl transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[16/10] w-full">
          <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
        </div>
      </CardContent>
    </Card>
  )
}
