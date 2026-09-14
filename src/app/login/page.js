"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEntrando(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });

    if (!res.ok) {
      setEntrando(false);
      const data = await res.json();
      setErro(data.error ?? "Não foi possível entrar.");
      return;
    }

    // Dá tempo da animação de saída rodar antes de trocar de tela —
    // sem isso o Next troca a página na hora e nunca dá pra ver.
    setSaindo(true);
    setTimeout(() => {
      router.replace(searchParams.get("redirect") || "/");
      router.refresh();
    }, 380);
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-[#242424] transition-all duration-[380ms] ease-in ${
        saindo ? "scale-105 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <Image
        src="/images/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <p
            className="brand-panel-fade flex items-center justify-center gap-2 font-nunito text-sm font-bold text-white"
            style={{ "--fd": "0ms" }}
          >
            <span className="fogo-animado">🔥</span> STUDIO NANZA
          </p>

          <h1
            className="brand-panel-fade mt-5 font-rubik text-[clamp(1.9rem,7vw,3.75rem)] font-bold uppercase leading-[1.05] tracking-tight text-white"
            style={{ "--fd": "90ms" }}
          >
            <span className="block whitespace-nowrap">Where ideas</span>
            <span className="block whitespace-nowrap text-[#ffc928]">
              become identity
              <span className="ml-2 inline-block h-[0.2em] w-[0.2em] rounded-full bg-[#f7faff] align-baseline" />
            </span>
          </h1>

          <form
            onSubmit={handleSubmit}
            className="brand-card-fade mx-auto mt-10 w-full max-w-[300px] rounded-[20px] border border-white/25 bg-[#506588]/25 p-4 text-left shadow-[0px_26px_46px_-10px_rgba(0,0,0,0.35)] backdrop-blur-sm"
            style={{ "--fd": "220ms" }}
          >
            <label className="block font-rubik text-sm font-medium tracking-[0.02em] text-white">
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              autoFocus
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-2 w-full rounded-[14px] bg-[#344e68] px-4 py-2.5 font-nunito text-sm font-bold uppercase text-white shadow-[0px_4px_0px_0px_#52677c] outline-none placeholder:text-[#8095aa]"
            />

            {erro && (
              <p className="mt-3 text-sm text-red-300" role="alert">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={entrando}
              className="mt-5 w-full rounded-[14px] bg-[#ffc928] py-2.5 font-nunito text-sm font-black uppercase text-[#242424] shadow-[0px_4px_0px_0px_#ad5800] transition duration-100 active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-[0px_4px_0px_0px_#ad5800]"
            >
              {entrando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p
            className="brand-panel-fade mx-auto mt-6 max-w-[220px] text-center font-nunito text-sm font-bold text-[#f7faff]"
            style={{ "--fd": "320ms" }}
          >
            Acesso restrito à equipe do Studio Nanza.
          </p>
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
