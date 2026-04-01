// C:\Users\chiso\nextjs\study-allot\src\app\(public)\privacy\page.tsx

import BackButton from "@/components/back-button"

export const metadata = {
    title: "プライバシーポリシー | StudyAllot",
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

function SubTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-base font-semibold text-foreground/90">
            {children}
        </h3>
    )
}

function List({ children }: { children: React.ReactNode }) {
    return (
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            {children}
        </ul>
    )
}

export default function PrivacyPage() {
    const lastUpdated = "2026年2月22日"

    return (
        <main className="mx-auto max-w-3xl px-4 md:px-6 py-12">
             
            <header className="space-y-2">
                <BackButton fallbackHref="/" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
                <p className="text-sm text-muted-foreground">最終更新日：{lastUpdated}</p>
            </header>

            <div className="mt-10 space-y-6">
                <Section title="はじめに">
                    <p>
                        StudyAllot（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
                        本ポリシーは、本サービスにおいて取得する情報、利用目的、管理方法、ユーザーの権利等について定めるものです。
                    </p>
                </Section>

                <Section title="1. 取得する情報">
                    <div className="space-y-3">
                        <SubTitle>1.1 ユーザーが提供する情報</SubTitle>
                        <List>
                            <li>ログインに関する情報（Googleアカウントによる認証）</li>
                            <li>学習管理データ（プロジェクト名、教材名、セクション名、周回数、計画期間等、ユーザーが入力する内容）</li>
                        </List>
                    </div>

                    <div className="space-y-3">
                        <SubTitle>1.2 自動的に取得される可能性のある情報</SubTitle>
                        <List>
                            <li>セッション情報（ログイン状態維持のためのトークン等）</li>
                            <li>アクセスログ（障害対応・セキュリティ確保のための最小限のログ）</li>
                        </List>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            ※本サービスが解析ツール（例：Google Analytics等）を導入する場合は、本ポリシーに追記します。
                        </p>
                    </div>
                </Section>

                <Section title="2. 利用目的">
                    <List>
                        <li>ユーザー認証およびアカウント管理</li>
                        <li>学習管理データの保存・同期・表示（デイリータスク、ガントチャート、実績等）</li>
                        <li>不正利用の防止、セキュリティ確保</li>
                        <li>サービス改善（不具合修正、機能改善、品質向上）</li>
                    </List>
                </Section>

                <Section title="3. 外部サービスの利用（第三者提供）">
                    <p>
                        本サービスは、サービス提供のために以下の外部サービスを利用する場合があります。
                        これらのサービスにおいて、ユーザー認証やデータ保存のために必要な範囲で情報が取り扱われます。
                    </p>
                    <List>
                        <li>Supabase（認証・データベース等）</li>
                        <li>Google（Googleアカウント認証）</li>
                    </List>
                    <p>
                        本サービスは、法令に基づく場合またはユーザーの同意がある場合を除き、ユーザーの個人情報を第三者に販売・貸与することはありません。
                    </p>
                </Section>

                <Section title="4. データの保存と保護">
                    <List>
                        <li>通信はTLS/SSL等により暗号化される環境で取り扱われます。</li>
                        <li>アクセス制御等により、原則としてユーザーは自身のデータのみにアクセスできるよう設計します。</li>
                    </List>
                </Section>

                <Section title="5. 保存期間と削除">
                    <p>
                        ユーザーは、本サービス上の機能または運営者への連絡により、アカウント削除およびデータ削除を依頼できます。
                        技術上・運用上必要な範囲で削除に一定期間を要する場合があります。
                    </p>
                </Section>

                <Section title="6. Cookie等の利用">
                    <p>
                        本サービスは、ログイン状態の維持等のためにCookieまたは同等の技術を使用する場合があります。
                        解析・広告目的のトラッキングを行う場合は、本ポリシーに明記します。
                    </p>
                </Section>

                <Section title="7. 未成年のプライバシー">
                    <p>
                        本サービスは、未成年者が利用する場合、保護者の同意のもとで利用されることを推奨します。
                        本サービスは、意図的に13歳未満の児童から個人情報を収集することを目的としません。
                    </p>
                </Section>

                <Section title="8. 本ポリシーの変更">
                    <p>
                        法令の改正、サービス内容の変更等により、本ポリシーを変更することがあります。
                        重要な変更がある場合は、本サービス上での掲示等、適切な方法で通知します。
                    </p>
                </Section>

                <Section title="9. お問い合わせ">
                    <p>本ポリシーに関するお問い合わせは、以下までご連絡ください。</p>

                    <List>
                        <li>
                            連絡先：
                            <a
                                href="https://forms.gle/Fp7F26TxhnYqzsZD9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-4 hover:text-foreground"
                            >
                                https://forms.gle/Fp7F26TxhnYqzsZD9
                            </a>
                        </li>
                    </List>
                </Section>
            </div>
        </main>
    )
}