'use client';

import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';

type Task = {
  id: string;
  name: string;
  start: string;        // 'YYYY-MM-DD'
  end: string;          // 'YYYY-MM-DD'
  progress?: number;    // 0..100
  dependencies?: string; // 'id1,id2'
  custom_class?: string;
};

export default function StudyGantt({
  tasks,
  viewMode = 'Month',
}: {
  tasks: Task[];
  viewMode?: 'Day' | 'Week' | 'Month';
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 既存を消してから再生成（簡易リフレッシュ）
    containerRef.current.innerHTML = '';

    const gantt: any = new (Gantt as any)(containerRef.current, tasks, {
      view_mode: viewMode,
      language: 'en', // 必要なら 'ja'
      custom_popup_html: null,
    });

    ganttRef.current = gantt;

    const onResize = () => {
      try { gantt.refresh(tasks); } catch {}
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (containerRef.current) containerRef.current.innerHTML = '';
      ganttRef.current = null;
    };
  }, [tasks, viewMode]);

  return (
    <div className="overflow-auto">
      <div ref={containerRef} />
    </div>
  );
}
