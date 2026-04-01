export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-slate-300">
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]">
        法律與聯絡資訊
      </h1>
      <p className="mb-14 text-sm text-neutral-500">Legal &amp; Contact</p>

      {/* Terms 區塊 */}
      <section id="terms" className="mb-12 scroll-mt-24">
        <h2 className="mb-6 border-l-[3px] border-cyan-400 pl-4 text-xl font-semibold text-cyan-200">
          Terms of Service <span className="text-neutral-500">服務條款</span>
        </h2>
        <div className="rounded-2xl border border-white/5 bg-neutral-900/50 px-7 py-6">
          {/* 警示公告 */}
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <span className="mt-px text-yellow-400">⚠</span>
            <p className="text-sm font-semibold text-yellow-300">【測試版特別公告】</p>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-neutral-300">
            <p>歡迎使用 vAcAnt 測試版。</p>
            <p>
              本站目前處於開發與測試階段。為了優化系統，我們保留隨時重置（Reset）或刪除所有帳號數據的權利，包含但不限於遊戲幣、虛擬道具、等級及交易紀錄。
            </p>
            <p>
              站內所有貨幣及商品均為虛擬測試用途，不具備任何現實世界的貨幣價值，亦不提供任何形式的兌換或補償。
            </p>
            <p>
              作為測試服，系統可能會出現 Bug 或不預期的停機，我們不對因系統錯誤導致的數據損失負責。
            </p>
            <p>開發團隊可隨時修改本條款，恕不另行個別通知。</p>
          </div>
        </div>
      </section>

      {/* Privacy 區塊 */}
      <section id="privacy" className="mb-12 scroll-mt-24">
        <h2 className="mb-6 border-l-[3px] border-cyan-400 pl-4 text-xl font-semibold text-cyan-200">
          Privacy Policy <span className="text-neutral-500">隱私權政策</span>
        </h2>
        <div className="rounded-2xl border border-white/5 bg-neutral-900/50 px-7 py-6">
          <p className="mb-4 text-sm font-semibold text-cyan-300">隱私資訊聲明</p>
          <div className="space-y-3 text-sm leading-relaxed text-neutral-300">
            <p>在 vAcAnt，我們極度重視你的隱私。</p>
            <p>
              我們僅透過 Google OAuth 收集你的 Email 地址與公開大頭貼。這些資訊僅用於建立你的帳號、識別身分以及儲存你的遊戲進度。
            </p>
            <p>你的所有資料均安全地儲存在 Supabase 雲端資料庫中。</p>
            <p>
              我們使用 Google 提供的登入服務，相關隱私規範請參考 Google 隱私權政策。
            </p>
            <p>我們承諾絕不會將你的個人資料出售或提供給任何第三方廣告商。</p>
            <p>
              若你希望刪除你的帳號與所有相關紀錄，請透過下方聯絡管道聯繫我。
            </p>
          </div>
        </div>
      </section>

      {/* Contact 區塊 */}
      <section id="contact" className="mb-12 scroll-mt-24">
        <h2 className="mb-6 border-l-[3px] border-cyan-400 pl-4 text-xl font-semibold text-cyan-200">
          Contact <span className="text-neutral-500">聯絡我</span>
        </h2>
        <div className="rounded-2xl border border-white/5 bg-neutral-900/50 px-7 py-6">
          <p className="mb-6 text-sm text-neutral-400">
            如果你有任何問題，或是想開發合作，可以透過以下方式找到我。
          </p>
          <address className="not-italic">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {/* Email */}
              <a
                href="mailto:inori67business@gmail.com"
                className="group flex flex-1 items-center gap-3 rounded-xl border border-white/8 bg-neutral-800/60 px-4 py-3.5 transition hover:border-cyan-500/40 hover:bg-cyan-500/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500/20">
                  {/* Mail icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                    Email
                  </p>
                  <p className="truncate text-sm font-medium text-cyan-300 transition group-hover:text-cyan-200">
                    inori67business@gmail.com
                  </p>
                </span>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Inori0o0"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-1 items-center gap-3 rounded-xl border border-white/8 bg-neutral-800/60 px-4 py-3.5 transition hover:border-purple-500/40 hover:bg-purple-500/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition group-hover:bg-purple-500/20">
                  {/* GitHub icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                    GitHub
                  </p>
                  <p className="truncate text-sm font-medium text-purple-300 transition group-hover:text-purple-200">
                    Inori0o0
                  </p>
                </span>
              </a>
            </div>
          </address>
        </div>
      </section>
    </main>
  );
}
