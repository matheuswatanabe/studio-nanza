"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logomark from "@/components/Logomark";
import IdentityOrb from "@/components/IdentityOrb";

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
    <div className="flex min-h-screen w-full items-center justify-center bg-brand-paper p-4 sm:p-8">
      <div
        className="card-in grid w-full max-w-5xl grid-cols-1 gap-0 overflow-hidden rounded-[28px] bg-brand-ink shadow-[0_60px_120px_-40px_rgba(11,42,61,0.45)] lg:grid-cols-2"
        style={{ minHeight: "580px" }}
      >
        <div className="flex flex-col justify-between p-8 sm:p-12">
          <div
            className="brand-panel-fade flex items-center gap-2.5"
            style={{ "--fd": "0ms" }}
          >
            <Logomark tone="light" size={26} />
            <span className="text-sm font-medium text-brand-paper">
              Studio Nanza
            </span>
          </div>

          <div className="max-w-sm">
            <p
              className="brand-panel-fade text-[11px] font-medium uppercase tracking-[0.24em] text-brand-gold"
              style={{ "--fd": "60ms" }}
            >
              Painel interno
            </p>
            <h1
              className="brand-panel-fade mt-3 font-display text-4xl font-medium italic leading-[1.15] text-brand-paper"
              style={{ "--fd": "110ms" }}
            >
              Where ideas
              <br />
              become identity.
            </h1>

            <form onSubmit={handleSubmit} className="mt-9">
              <label
                className="brand-panel-fade block text-[11px] font-medium uppercase tracking-wide text-brand-paper/45"
                style={{ "--fd": "170ms" }}
              >
                Senha
              </label>
              <input
                type="password"
                placeholder="Sua senha"
                autoFocus
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="brand-panel-fade mt-2 w-full rounded-full border border-brand-paper/15 bg-brand-paper/[0.06] px-5 py-3 text-sm text-brand-paper outline-none transition placeholder:text-brand-paper/30 focus:border-brand-paper/40 focus:bg-brand-paper/10"
                style={{ "--fd": "210ms" }}
              />

              {erro && (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={entrando}
                className="brand-panel-fade mt-4 w-full rounded-full bg-brand-gold px-5 py-3 text-sm font-medium text-brand-ink-deep transition duration-150 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                style={{ "--fd": "250ms" }}
              >
                {entrando ? "Entrando..." : "Entrar"}
              </button>

              <p
                className="brand-panel-fade mt-4 text-center text-xs text-brand-paper/35"
                style={{ "--fd": "290ms" }}
              >
                Acesso restrito à equipe do Studio Nanza.
              </p>
            </form>
          </div>

          <div
            className="brand-panel-fade inline-flex w-fit items-center gap-2 rounded-full border border-brand-paper/15 px-3 py-1.5 text-[11px] text-brand-paper/50"
            style={{ "--fd": "330ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Sistema ativo
          </div>
        </div>

        <div className="hidden p-3 lg:block">
          <IdentityOrb />
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
