'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// 簡易スラグ化（英数・ハイフンのみ。重複は呼び出し側でメッセージ返す）
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')       // ダイアクリティクス除去
    .replace(/[^\w\s-]/g, '')              // 英数・アンダー・空白・ハイフン以外除去
    .trim()
    .replace(/[\s_-]+/g, '-')              // 連続空白/アンダー/ハイフン→ハイフン
    .replace(/^-+|-+$/g, '')               // 先頭末尾のハイフン除去
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  // 認証ユーザー
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) {
    return { ok: false, message: 'ログインが必要です。' }
  }

  // フォーム値の受け取り
  const name = String(formData.get('name') || '').trim()
  const purpose = String(formData.get('purpose') || 'other') // UIのセレクト
  const goal = String(formData.get('goal') || '').trim()
  const notes = String(formData.get('notes') || '')
  const weeklyHoursStr = String(formData.get('weeklyHours') || '0')
  const weekly_hours = Number.isNaN(Number(weeklyHoursStr)) ? 0 : parseInt(weeklyHoursStr, 10)

  if (!name) {
    return { ok: false, message: 'プロジェクト名は必須です。' }
  }

  // slug（手入力が無い前提：nameから生成。将来フィールド追加するなら formData.get('slug') を優先）
  let slug = slugify(name)
  if (!slug) slug = `p-${Date.now()}`

  // categoryにpurposeをそのまま入れる（DBにcategory列が無ければこのフィールドは外してください）
  const payload: Record<string, any> = {
    user_id: user.id,
    name,
    slug,
    category: purpose,        // 例: 'language' | 'exam' ...
    goal: goal || null,       // DBに列が無ければ削除
    notes: notes || null,     // 同上
    weekly_hours: weekly_hours || null, // 同上
  }

  // INSERT
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select('slug')   // 作成後のslugを確認
    .single()

  if (error) {
    // 一意制約違反（slugユニーク）: Postgresエラーコード 23505
    if ((error as any).code === '23505') {
      return { ok: false, message: '同じslug（URL用識別子）が既に存在します。名前を少し変えてください。' }
    }
    return { ok: false, message: `作成に失敗しました: ${error.message}` }
  }

  // 一覧の再検証（DB読み込みに切替えた後に効く）
  revalidatePath('/project')

  // 詳細へ遷移
  redirect(`/project/`)
}
