import { Card } from "@/components/ui/card";
import { ProjectSelectButton } from "@/components/project-select-button";

// ★ クライアント境界の薄いラッパーを直接 import（dynamic不要）
import StudyGanttClient from "./_components/StudyGanttClient";

export default function DashboardPage() {
  const demoTasks = [
    { id: '1', name: 'シスタン',     start: '2025-10-01', end: '2025-12-31', progress: 30 },
    { id: '2', name: 'ヴィンテージ', start: '2025-10-15', end: '2025-11-30', progress: 10, dependencies: '1' },
    { id: '3', name: '英語長文700',  start: '2025-12-01', end: '2026-01-31', progress: 0  },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ProjectSelectButton />
      </div>
      <Card className="w-full overflow-hidden p-2">
        <StudyGanttClient tasks={demoTasks} viewMode="Month" />
      </Card>
    </div>
  );
}
