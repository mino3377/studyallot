// app/(public)/terms/page.tsx
import Link from "next/link"

export const metadata = {
  title: "利用規約 | StudyAllot",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card/60 p-6 md:p-7 space-y-4">
      <h2 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  )
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
      {children}
    </ul>
  )
}

export default function TermsPage() {
  const lastUpdated = "2026年2月22日"

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">利用規約</h1>
        <p className="text-sm text-muted-foreground">最終更新日：{lastUpdated}</p>
      </header>

      <div className="mt-10 space-y-6">
        <Section title="第1条（適用）">
          <p>
            本利用規約（以下「本規約」）は、StudyAllot（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは、本規約に同意のうえ本サービスを利用するものとします。
          </p>
        </Section>

        <Section title="第2条（アカウント）">
          <List>
            <li>ユーザーは、正確な情報に基づき本サービスを利用するものとします。</li>
            <li>ユーザーは、自己の責任においてログイン情報・端末等を管理するものとします。</li>
            <li>第三者による不正利用が疑われる場合、速やかに運営者へ連絡してください。</li>
          </List>
        </Section>

        <Section title="第3条（禁止事項）">
          <p>ユーザーは、以下の行為をしてはなりません。</p>
          <List>
            <li>法令または公序良俗に違反する行為</li>
            <li>不正アクセス、改ざん、脆弱性探索等、本サービスの運営を妨害する行為</li>
            <li>他者になりすます行為</li>
            <li>本サービスまたは第三者の権利（著作権、商標権、プライバシー等）を侵害する行為</li>
            <li>本サービスのサーバー・ネットワークに過度な負荷をかける行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </List>
        </Section>

        <Section title="第4条（ユーザーコンテンツ）">
          <List>
            <li>ユーザーが本サービスに入力した学習データ等（以下「ユーザーコンテンツ」）の責任はユーザーに帰属します。</li>
            <li>運営者は、本サービス提供・改善に必要な範囲でユーザーコンテンツを取り扱う場合があります。</li>
          </List>
        </Section>

        <Section title="第5条（サービスの提供・変更・停止）">
          <List>
            <li>運営者は、ユーザーへの事前通知なく、本サービスの内容を変更、追加、停止できるものとします。</li>
            <li>保守、障害、外部サービスの影響等により、本サービスが利用できない場合があります。</li>
          </List>
        </Section>

        <Section title="第6条（免責）">
          <List>
            <li>本サービスは学習計画・進捗管理を支援するものであり、学習成果・合格等を保証するものではありません。</li>
            <li>運営者は、本サービスの正確性・完全性・有用性について、明示または黙示の保証を行いません。</li>
            <li>
              運営者は、ユーザーの本サービス利用により生じたいかなる損害についても、運営者に故意または重過失がある場合を除き責任を負いません。
            </li>
          </List>
        </Section>

        <Section title="第7条（利用制限・アカウント削除）">
          <p>
            ユーザーが本規約に違反した場合、運営者は、事前の通知なく本サービスの利用制限、アカウント停止等の措置を行うことがあります。
          </p>
        </Section>

        <Section title="第8条（個人情報の取り扱い）">
          <p>
            個人情報の取り扱いは、{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              プライバシーポリシー
            </Link>{" "}
            に従います。
          </p>
        </Section>

        <Section title="第9条（準拠法・管轄）">
          <p>
            本規約は日本法に準拠します。本サービスに関して紛争が生じた場合、運営者所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </Section>
      </div>
    </main>
  )
}