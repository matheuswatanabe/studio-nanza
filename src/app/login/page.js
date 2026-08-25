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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-neutral-900">Studio</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Digite a senha para acessar o sistema.
        </p>

        <input
          type="password"
          placeholder="Senha"
          autoFocus
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />

        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={entrando}
          className="mt-4 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </form>
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
