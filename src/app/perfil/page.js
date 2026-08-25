"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">Quem é você?</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Selecione seu perfil para continuar.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {PERFIS.map((perfil) => (
            <button
              key={perfil}
              type="button"
              onClick={() => selecionar(perfil)}
              disabled={selecionando !== null}
              className="flex items-center gap-3 rounded-lg border border-neutral-300 px-4 py-3 text-left text-sm font-medium text-neutral-900 outline-none hover:border-neutral-900 disabled:opacity-50"
            >
              <Avatar nome={perfil} size="md" />
              {selecionando === perfil ? "Entrando..." : perfil}
            </button>
          ))}
        </div>

        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
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
