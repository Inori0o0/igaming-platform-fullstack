"use client";

import { supabase } from "@/src/lib/supabaseClient";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Avatar } from "@/src/components/ui/Avatar";
import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleTest() {
    const { data, error } = await supabase.auth.getSession();
    console.log("Supabase session:", data, error);
  }

  function toggleModal() {
    setIsModalOpen((prev) => !prev);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.25),transparent_55%)]">
      <Card
        title="vAcAnt Client Portal"
        description="共用 UI 元件示範區塊"
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3">
          <Avatar fallback="Guest User" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-neutral-50">Guest User</p>
            <p className="text-xs text-neutral-400">
              之後會接上 Supabase 使用者資料
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Input
            label="Email"
            placeholder="you@example.com"
            helperText="暫時只是UI元件尚未送出到 Supabase"
          />

          <Input
            placeholder="搜尋..."
            leftSlot={<span className="text-xs text-neutral-400">💰</span>}
            rightSlot={
              <span className="text-xs text-neutral-400">V. Coins</span>
            }
          />

          <div className="flex items-center gap-2">
            <Button onClick={handleTest}>測試 Supabase 連線</Button>
            <Button onClick={toggleModal}>開啟 Modal</Button>
          </div>
        </div>
      </Card>
      <Modal open={isModalOpen} onClose={toggleModal}>
        <div className="space-y-3">
          <p>Modal Content</p>
          <Button onClick={toggleModal}>關閉 Modal</Button>
        </div>
      </Modal>
    </main>
  );
}
