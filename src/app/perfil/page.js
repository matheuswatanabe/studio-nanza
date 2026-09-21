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
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-paper">
      <div className="brasa-fundo pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <p
            className="brand-panel-fade flex items-center gap-2.5 font-nunito text-[11px] font-bold uppercase tracking-[0.22em] text-brand-ink/70"
            style={{ "--fd": "0ms" }}
          >
            <span className="brasa" aria-hidden>
              <span className="text-[15px] leading-none">🔥</span>
            </span>
            Studio Nanza
          </p>

          <h1
            className="brand-panel-fade mt-7 font-rubik text-[clamp(1.8rem,6vw,2.6rem)] font-bold uppercase leading-[0.98] tracking-[-0.02em] text-brand-ink"
            style={{ "--fd": "80ms" }}
          >
            Quem é <span className="text-brand-gold">você?</span>
          </h1>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-5">
            {PERFIS.map((perfil, i) => {
              const escolhido = selecionando === perfil;
              const outroEscolhido = selecionando !== null && !escolhido;

              return (
                <button
                  key={perfil}
                  type="button"
                  onClick={() => selecionar(perfil)}
                  disabled={selecionando !== null}
                  style={{ "--fd": `${160 + i * 80}ms` }}
                  className={`brand-panel-fade group flex flex-col items-center gap-4 rounded-2xl py-4 transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold ${
                    outroEscolhido ? "opacity-30" : "hover:-translate-y-1"
                  }`}
                >
                  {/* Monograma: a inicial do nome, que se inverte ao passar
                      o mouse e fica cheia quando o perfil é escolhido. */}
                  <span
                    className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border font-rubik text-2xl font-bold transition duration-300 ease-out sm:h-24 sm:w-24 sm:text-3xl ${
                      escolhido
                        ? "border-brand-ink bg-brand-ink text-brand-paper shadow-[0_16px_34px_-18px_rgba(11,42,61,0.65)]"
                        : "border-brand-ink/20 text-brand-ink group-hover:border-brand-ink group-hover:bg-brand-ink group-hover:text-brand-paper group-hover:shadow-[0_16px_34px_-18px_rgba(11,42,61,0.65)]"
                    }`}
                  >
                    {perfil.charAt(0)}
                  </span>

                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-ink/60 transition-colors duration-300 group-hover:text-brand-ink">
                    {escolhido ? "Entrando..." : perfil}
                  </span>
                </button>
              );
            })}
          </div>

          {erro && (
            <p className="mt-6 text-sm text-[#9b3b2e]" role="alert">
              {erro}
            </p>
          )}

          <p
            className="brand-panel-fade mt-10 text-xs leading-relaxed text-brand-ink/45"
            style={{ "--fd": "420ms" }}
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
