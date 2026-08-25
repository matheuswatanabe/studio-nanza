"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logomark from "@/components/Logomark";

function BrandPanel() {
  return (
    <div className="relative hidden w-[44%] shrink-0 overflow-hidden bg-brand-ink lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 12% 8%, rgba(255,255,255,0.07), transparent 55%), radial-gradient(90% 70% at 90% 100%, rgba(176,141,87,0.16), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#F3F4EF 1px, transparent 1px), linear-gradient(90deg, #F3F4EF 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 px-14 pt-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-brand-gold">
          Painel interno
        </p>
      </div>

      <div className="relative z-10 px-14 pb-16">
        <Logomark tone="light" size={56} animate />
        <h1 className="mt-8 font-display text-[2.75rem] font-medium leading-[1.05] text-brand-paper">
          Studio
          <br />
          Nanza
        </h1>
        <p className="mt-5 max-w-xs font-display text-lg italic leading-snug text-brand-paper/70">
          Where ideas become identity.
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEntrando(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });

    setEntrando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível entrar.");
      return;
    }

    router.replace(searchParams.get("redirect") || "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full bg-brand-paper">
      <BrandPanel />

      <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <div
            className="brand-panel-fade mb-10 flex items-center gap-3 lg:hidden"
            style={{ "--fd": "0ms" }}
          >
            <Logomark tone="dark" size={36} />
            <span className="font-display text-lg font-medium text-brand-ink">
              Studio Nanza
            </span>
          </div>

          <div className="brand-panel-fade" style={{ "--fd": "60ms" }}>
            <h2 className="font-display text-3xl font-medium text-brand-ink">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-brand-ink/60">
              Digite a senha para acessar o sistema.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="brand-panel-fade mt-8"
            style={{ "--fd": "120ms" }}
          >
            <label className="block text-xs font-medium uppercase tracking-wide text-brand-ink/50">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              autoFocus
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-2 w-full rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-sm text-brand-ink outline-none transition focus:border-brand-ink focus:ring-2 focus:ring-brand-ink/10"
            />

            {erro && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={entrando}
              className="mt-6 w-full rounded-xl bg-brand-ink px-4 py-3 text-sm font-medium text-brand-paper transition hover:bg-brand-ink-soft disabled:opacity-50"
            >
              {entrando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p
            className="brand-panel-fade mt-10 text-xs text-brand-ink/40"
            style={{ "--fd": "180ms" }}
          >
            Acesso restrito à equipe do Studio Nanza.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
