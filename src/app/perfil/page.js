"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logomark from "@/components/Logomark";
import IdentityOrb from "@/components/IdentityOrb";
import { PERFIS } from "@/lib/auth";

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
              Quem é você
              <br />
              hoje?
            </h1>

            <div className="mt-9 flex flex-col gap-2.5">
              {PERFIS.map((perfil, i) => {
                const carregando = selecionando === perfil;
                return (
                  <button
                    key={perfil}
                    type="button"
                    onClick={() => selecionar(perfil)}
                    disabled={selecionando !== null}
                    style={{ "--fd": `${170 + i * 60}ms` }}
                    className="brand-panel-fade group flex items-center gap-3.5 rounded-full border border-brand-paper/15 bg-brand-paper/[0.06] px-3 py-2.5 text-left transition duration-150 hover:border-brand-paper/40 hover:bg-brand-paper/10 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold font-display text-sm font-medium text-brand-ink-deep">
                      {INICIAL_ESTILO[perfil] ?? perfil.charAt(0)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-brand-paper">
                      {carregando ? "Entrando..." : perfil}
                    </span>
                    <span className="pr-1 text-brand-paper/30 transition group-hover:translate-x-0.5 group-hover:text-brand-paper/60">
                      &#8594;
                    </span>
                  </button>
                );
              })}
            </div>

            {erro && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {erro}
              </p>
            )}

            <p
              className="brand-panel-fade mt-6 text-xs text-brand-paper/35"
              style={{ "--fd": "360ms" }}
            >
              Cada lançamento fica identificado com o perfil selecionado.
            </p>
          </div>

          <div
            className="brand-panel-fade inline-flex w-fit items-center gap-2 rounded-full border border-brand-paper/15 px-3 py-1.5 text-[11px] text-brand-paper/50"
            style={{ "--fd": "400ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Sistema ativo
          </div>
        </div>

        <div className="hidden p-3 lg:block">
          <IdentityOrb
            orbDelay="200ms"
            lineDelay="300ms"
            pathDelay="380ms"
            telemetryDelay="460ms"
          />
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
