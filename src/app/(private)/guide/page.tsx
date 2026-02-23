import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <Card>
        <CardHeader className="">
          <CardTitle className="text-bold text-xl">新規作成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6">
          <div className="space-y-1">
            <div className="font-medium">1) プロジェクトを作る</div>
             <p className="text-muted-foreground">
              例：プロジェクト名は「TOEIC」。
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>メニュー →「新規プロジェクト」</li>
            </ul>
          </div>

          <div className="space-y-1">
            <div className="font-medium">2) 教材を作る（プロジェクトに紐付け）</div>
            <p className="text-muted-foreground">
              例：「TOEIC」プロジェクトの教材として「公式問題集」。
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>メニュー →「教材教材」</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="">
          <CardTitle className="text-bold text-xl">記録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6">

          <div className="space-y-1">
            <div className="font-medium">デイリータスク</div>
            <ul className="list-disc ml-5 space-y-1">
              <li>メニュー →「デイリータスク」</li>
              <li>その日にやるべきタスクが自動で出ます</li>
              <li>終わったら、その日のタスクをまとめてチェックできます</li>
            </ul>
          </div>

          <div className="space-y-1">
            <div className="font-medium">教材ページ</div>
            <ul className="list-disc ml-5 space-y-1">
              <li>メニュー →「教材」→ 各教材の「詳細を見る ＞」ボタンから教材を開きます</li>
              <li>「何周目の何セクションを、何月何日にやったか」を自由にチェック・削除できます</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
