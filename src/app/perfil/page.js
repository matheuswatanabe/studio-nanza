"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { PERFIS } from "@/lib/auth";

// O card do Matheus é rotulado "MATH" no design (apelido/estilo visual),
// mas o valor salvo continua "Matheus" — mesmos três perfis de sempre,
// só muda a etiqueta mostrada no card.
const ROTULO_CARD = { Natan: "NATAN", Lucas: "LUCAS", Matheus: "MATH" };
const AVATAR_CARD = {
  Natan: "/images/avatar-natan.jpg",
  Lucas: "/images/avatar-lucas.jpg",
  Matheus: "/images/avatar-math.jpg",
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#242424]">
      <Image
        src="/images/selecao-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/25" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-16">
        <div className="brand-card-fade w-full max-w-4xl rounded-[28px] border border-white/15 bg-[#2d4670]/25 p-6 text-center shadow-[0px_40px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-10">
          <p
            className="brand-panel-fade flex items-center justify-center gap-2 font-nunito text-sm font-bold text-white"
            style={{ "--fd": "0ms" }}
          >
            <span className="fogo-animado">🔥</span> STUDIO NANZA
          </p>

          <h1
            className="brand-panel-fade mt-4 font-rubik text-[clamp(1.9rem,6vw,3.5rem)] font-bold uppercase leading-[1.05] tracking-tight text-white"
            style={{ "--fd": "90ms" }}
          >
            <span className="text-[#ffc928]">Quem é</span> você?
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {PERFIS.map((perfil, i) => {
              const carregando = selecionando === perfil;
              return (
                <button
                  key={perfil}
                  type="button"
                  onClick={() => selecionar(perfil)}
                  disabled={selecionando !== null}
                  style={{ "--fd": `${180 + i * 70}ms` }}
                  className="brand-panel-fade group relative flex aspect-[280/419] w-full flex-col overflow-hidden rounded-[20px] border border-white/15 bg-[#506588]/20 shadow-[0px_15px_30px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:border-[#ffc928]/70 hover:shadow-[0px_25px_45px_-10px_rgba(0,0,0,0.55)] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
                >
                  <span className="relative z-10 py-3 font-rubik text-lg font-bold uppercase tracking-tight text-white transition-colors group-hover:text-[#ffc928]">
                    {carregando ? "Entrando..." : ROTULO_CARD[perfil] ?? perfil}
                  </span>
                  <span className="relative flex-1 overflow-hidden rounded-b-[20px]">
                    <Image
                      src={AVATAR_CARD[perfil]}
                      alt={perfil}
                      fill
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-b-[20px] ring-0 ring-[#ffc928] transition-all duration-300 group-hover:ring-4" />
                  </span>
                </button>
              );
            })}
          </div>

          {erro && (
            <p className="mt-5 text-sm text-red-300" role="alert">
              {erro}
            </p>
          )}

          <p
            className="brand-panel-fade mx-auto mt-8 max-w-sm font-nunito text-sm font-bold text-[#f7faff]"
            style={{ "--fd": "380ms" }}
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
