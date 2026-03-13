"use client";

import { supabase } from "@/src/lib/supabaseClient";

export default function Home() {
  async function handleTest() {
    const { data, error } = await supabase.auth.getSession();
    console.log("Supabase session:", data, error);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Client Portal</h1>
      <button
        type="button"
        onClick={handleTest}
        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-400 transition-colors"
      >
        測試 Supabase 連線
      </button>
    </main>
  );
}
