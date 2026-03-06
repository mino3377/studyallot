import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Props = {
  shareUrl: string
  shareOpen: boolean
  setShareOpen: (open: boolean) => void
  showNotice: (msg: string) => void
  notice: string
}

export function PlanShareDialog({
  shareUrl,
  shareOpen,
  setShareOpen,
  showNotice,
  notice,
}: Props) {
  return (
    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>共有URL</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <Input readOnly value={shareUrl} />
          <Button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl)
                showNotice("コピーしました")
              } catch {
                showNotice("コピーに失敗しました（手動で選択してコピーしてください）")
              }
            }}
          >
            コピー
          </Button>
          {notice ? (
            <div className="text-xs text-muted-foreground">{notice}</div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}