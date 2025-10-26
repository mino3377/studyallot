export type DailyTask = {
  id: string;
  materialId: number;        // 教材詳細リンク用
  sectionId: number;         // 保存用
  rapNo: number;             // 保存用（周回番号 1-based）
  material: string;          // 教材名
  unitLabel: string;         // 実際にやるセクション名
  
};

export type DayBucket = {
  dateISO: string;  // YYYY-MM-DD
  tasks: DailyTask[];
};