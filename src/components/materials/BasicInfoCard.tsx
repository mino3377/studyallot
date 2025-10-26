// src/components/materials/BasicInfoCard.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { MaterialInfoProps, ProjectOption } from "@/lib/type/material";

export type { ProjectOption }; // named export

export default function BasicInfoCard({
  title,
  onChangeTitle,
  projectId,
  onChangeProjectId,
  projects,
  typeValue,
  onChangeType,
  author,
  onChangeAuthor,
  link,
  onChangeLink,
}: MaterialInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">マテリアルの基本情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[1fr_0.5fr_0.5fr]">
          {/* 教材名 */}
          <div className="space-y-2">
            <Label htmlFor="title">マテリアル名</Label>
            <Input id="title" value={title} onChange={(e) => onChangeTitle(e.target.value)} required />
          </div>

          {/* プロジェクト選択 */}
          <div className="space-y-2 mx-auto">
            <Label htmlFor="proj">プロジェクト</Label>
            <Select value={projectId} onValueChange={(v) => onChangeProjectId(v)}>
              <SelectTrigger id="proj">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="__none" disabled>プロジェクトがありません</SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 種別 */}
          <div className="space-y-2">
            <Label htmlFor="type">種別</Label>
            <Select value={typeValue} onValueChange={(v) => onChangeType(v as any)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book">書籍</SelectItem>
                <SelectItem value="video">動画</SelectItem>
                <SelectItem value="paper">論文/資料</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 著者・リンク */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="author">著者（任意）</Label>
            <Input id="author" value={author} onChange={(e) => onChangeAuthor(e.target.value)} placeholder="例）著者名 / 出版社など" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">参考リンク（任意）</Label>
            <Input id="link" value={link} onChange={(e) => onChangeLink(e.target.value)} placeholder="https://example.com" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
