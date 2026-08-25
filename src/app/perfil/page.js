"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PERFIS } from "@/lib/auth";

function PerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selecionando, setSelecionando] = useState(null);
  const [erro, setErro] = useState("");

  async function selecionar(perfil) {
    setErro("");
    setSelecionando(perfil);

    const res = await fetch("/api/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perfil }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível selecionar o perfil.");
      setSelecionando(null);
      return;
    }

    router.replace(searchParams.get("redirect") || "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full items-center bg-brand-paper px-6 sm:px-12 lg:px-24">
      <div className="w-full max-w-xl">
        <p
          className="brand-panel-fade text-xs font-medium uppercase tracking-[0.3em] text-brand-ink/40"
          style={{ "--fd": "0ms" }}
        >
          Studio Nanza
        </p>

        <h1
          className="brand-panel-fade mt-6 font-display text-[clamp(2.25rem,6vw,4.25rem)] font-medium leading-[1.05] tracking-tight text-brand-ink"
          style={{ "--fd": "60ms" }}
        >
          Quem é <em className="italic text-brand-ink/40">você?</em>
        </h1>

        <div
          className="mt-12 max-w-xs border-t border-brand-ink/10"
          role="group"
          aria-label="Selecione seu perfil"
        >
          {PERFIS.map((perfil, i) => {
            const carregando = selecionando === perfil;
            return (
              <button
                key={perfil}
                type="button"
                onClick={() => selecionar(perfil)}
                disabled={selecionando !== null}
                style={{ "--fd": `${120 + i * 50}ms` }}
                className="brand-panel-fade group flex w-full items-center gap-4 border-b border-brand-ink/10 py-4 text-left transition disabled:pointer-events-none disabled:opacity-40"
              >
                <span className="text-xs tabular-nums text-brand-ink/30">
                  0{i + 1}
                </span>
                <span className="flex-1 text-lg font-medium text-brand-ink transition group-hover:translate-x-1">
                  {carregando ? "Entrando..." : perfil}
                </span>
                <span className="text-brand-ink/25 transition group-hover:translate-x-1 group-hover:text-brand-ink">
                  →
                </span>
              </button>
            );
          })}
        </div>

        {erro && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {erro}
          </p>
        )}

        <p
          className="brand-panel-fade mt-10 text-xs text-brand-ink/35"
          style={{ "--fd": "280ms" }}
        >
          Cada lançamento fica identificado com o perfil selecionado.
        </p>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense>
      <PerfilForm />
    </Suspense>
  );
}
