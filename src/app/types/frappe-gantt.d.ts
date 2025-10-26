// C:\Users\chiso\nextjs\study-allot\src\app\types\frappe-gantt.d.ts

declare module 'frappe-gantt' {
  export type ViewMode = 'Day' | 'Week' | 'Month';

  export type Task = {
    id: string;
    name: string;
    start: string;        // 'YYYY-MM-DD'
    end: string;          // 'YYYY-MM-DD'
    progress?: number;    // 0..100
    dependencies?: string; // 'id1,id2'
    custom_class?: string;
  };

  export type GanttOptions = {
    view_mode: ViewMode;
    language?: string;
    custom_popup_html?: ((task: Task) => string) | null;
  };

  export default class Gantt {
    constructor(element: Element | string, tasks: Task[], options?: GanttOptions);
    refresh(tasks: Task[]): void;
    change_view_mode(mode: ViewMode): void;
  }
}
