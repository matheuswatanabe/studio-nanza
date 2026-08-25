"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logomark from "@/components/Logomark";
import { PERFIS } from "@/lib/auth";

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
        <Logomark tone="light" size={56} />
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

const INICIAL_ESTILO = {
  Natan: "N",
  Lucas: "L",
  Matheus: "M",
};

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
              Quem é você?
            </h2>
            <p className="mt-2 text-sm text-brand-ink/60">
              Selecione seu perfil para continuar.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {PERFIS.map((perfil, i) => {
              const carregando = selecionando === perfil;
              return (
                <button
                  key={perfil}
                  type="button"
                  onClick={() => selecionar(perfil)}
                  disabled={selecionando !== null}
                  style={{ "--fd": `${120 + i * 70}ms` }}
                  className="brand-panel-fade group flex items-center gap-4 rounded-xl border border-brand-ink/12 bg-white px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand-ink hover:shadow-[0_10px_24px_-14px_rgba(11,42,61,0.35)] disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-ink font-display text-lg font-medium text-brand-paper transition group-hover:bg-brand-ink-soft">
                    {INICIAL_ESTILO[perfil] ?? perfil.charAt(0)}
                  </span>
                  <span className="flex-1 text-sm font-medium text-brand-ink">
                    {carregando ? "Entrando..." : perfil}
                  </span>
                  <span className="text-brand-ink/25 transition group-hover:translate-x-0.5 group-hover:text-brand-ink/60">
                    &#8594;
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
            className="brand-panel-fade mt-10 text-xs text-brand-ink/40"
            style={{ "--fd": "340ms" }}
          >
            Cada lançamento fica identificado com o perfil selecionado.
          </p>
        </div>
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
