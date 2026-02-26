// src/components/materials/BasicInfoCard.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { MaterialInfoProps, ProjectOption } from "@/lib/type/material";

export type { ProjectOption };

export default function BasicInfoCard({
  title,
  onChangeTitle,
  projectId,
  onChangeProjectId,
  projects,
}: MaterialInfoProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">基本情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[1fr_0.5fr_0.5fr]">
          <div className="space-y-2">
            <Label htmlFor="title">教材名</Label>
            <Input id="title" value={title} onChange={(e) => onChangeTitle(e.target.value)} required />
          </div>


          <div className="justify-start space-y-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
