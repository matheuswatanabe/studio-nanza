"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="flex min-h-screen w-full items-center justify-center bg-brand-paper-dim px-6">
      <div className="w-full max-w-xl">
        <p
          className="brand-panel-fade text-xs font-medium uppercase tracking-[0.3em] text-brand-ink/60"
          style={{ "--fd": "0ms" }}
        >
          Studio Nanza
        </p>

        <h1
          className="brand-panel-fade mt-6 font-display text-[clamp(2.25rem,6vw,4.25rem)] font-medium leading-[1.05] tracking-tight text-brand-ink"
          style={{ "--fd": "60ms" }}
        >
          Where ideas
          <br />
          become <em className="italic text-brand-ink/55">identity.</em>
        </h1>

        <form onSubmit={handleSubmit} className="mt-12 max-w-xs">
          <label
            className="brand-panel-fade block text-xs font-medium uppercase tracking-wide text-brand-ink/55"
            style={{ "--fd": "120ms" }}
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
            className="brand-panel-fade mt-3 w-full border-b-2 border-brand-ink/35 bg-transparent py-2 text-lg text-brand-ink outline-none transition placeholder:text-brand-ink/35 focus:border-brand-ink"
            style={{ "--fd": "160ms" }}
          />

          {erro && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={entrando}
            className="brand-panel-fade group mt-8 inline-flex items-center gap-2 border-2 border-brand-ink px-5 py-2.5 text-sm font-medium text-brand-ink transition duration-150 hover:bg-brand-ink hover:text-brand-paper disabled:opacity-50"
            style={{ "--fd": "200ms" }}
          >
            {entrando ? "Entrando..." : "Entrar"}
            <span className="transition group-hover:translate-x-0.5">→</span>
          </button>
        </form>

        <p
          className="brand-panel-fade mt-16 text-xs text-brand-ink/50"
          style={{ "--fd": "240ms" }}
        >
          Acesso restrito à equipe do Studio Nanza.
        </p>
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
