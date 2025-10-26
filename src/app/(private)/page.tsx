//C:\Users\chiso\nextjs\study-allot\src\app\(private)\page.tsx

"use client"

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client"; // ← client.tsを作ってある前提
import AddButton from "../ui/button";
import Link from "next/link";

type Textbook = {
  id: string;
  title: string; // ← DBのカラム名に合わせる（textbook ではなく title）
};

export default function DashBoard() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("textbooks").select("*");
      if (error) {
        console.error(error);
      } else {
        setTextbooks(data);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>ここはダッシュボードです。</h1>
      <h2>必要なもの</h2>
      <ul>
        <li>登録した教材の進捗カレンダー</li>
        <li>教材の新規追加</li>
        <li>教材ごとの詳細ページへの遷移ボタン</li>
      </ul>

      <ul>
        {textbooks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>

      <Link href="/app/newbooks">
        <AddButton type="button" as="a">
          + 新規追加
        </AddButton>
      </Link>
    </div>
  );
}
