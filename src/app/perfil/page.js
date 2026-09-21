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
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-areia">
      <div className="brasa-fundo pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p
            className="brand-panel-fade flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-brand-preto/65"
            style={{ "--fd": "0ms" }}
          >
            <span className="brasa" aria-hidden>
              <span className="text-[15px] leading-none">🔥</span>
            </span>
            Studio Nanza
          </p>

          <h1
            className="brand-panel-fade mt-7 font-display text-[clamp(2.1rem,7vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-brand-preto"
            style={{ "--fd": "80ms" }}
          >
            Quem é você?
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
                  className={`brand-panel-fade group flex flex-col items-center gap-4 rounded-2xl py-4 transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-preto ${
                    outroEscolhido ? "opacity-30" : "hover:-translate-y-1"
                  }`}
                >
                  {/* Monograma: a inicial do nome, que se inverte ao passar
                      o mouse e fica cheia quando o perfil é escolhido. */}
                  <span
                    className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border font-display text-2xl font-semibold transition duration-300 ease-out sm:h-[5.5rem] sm:w-[5.5rem] sm:text-3xl ${
                      escolhido
                        ? "border-brand-preto bg-brand-preto text-brand-areia shadow-[0_16px_34px_-18px_rgba(26,24,21,0.65)]"
                        : "border-brand-preto/20 text-brand-preto group-hover:border-brand-preto group-hover:bg-brand-preto group-hover:text-brand-areia group-hover:shadow-[0_16px_34px_-18px_rgba(26,24,21,0.65)]"
                    }`}
                  >
                    {perfil.charAt(0)}
                  </span>

                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-preto/65 transition-colors duration-300 group-hover:text-brand-preto">
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
            className="brand-panel-fade mt-10 text-xs leading-relaxed text-brand-preto/65"
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
