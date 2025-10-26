"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function NewBooks() {
  const [inputValue, setInputValue] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const SubmitTextbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!inputValue.trim()) return;

    // insert = 「テーブルに行を追加する」
    const { data, error } = await supabase
      .from("textbooks")
      .insert([{ title: inputValue }])
      .select()
      .single();

    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      console.log("教材を追加:", data);
    }

    setInputValue("");
  };

  return (
    <div>
      <h1>ここで新しい教材追加</h1>
      <form onSubmit={SubmitTextbook}>
        <label htmlFor="textbook">教材名</label>
        <input
          type="text"
          id="textbook"
          name="textbook"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">登録</button>
      </form>

      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}
