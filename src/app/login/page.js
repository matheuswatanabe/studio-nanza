"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    }, 480);
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-brand-areia transition-all duration-[480ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        saindo ? "scale-[1.01] opacity-0" : "scale-100 opacity-100"
      }`}
    >
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
            Where ideas
            <br />
            become identity
          </h1>

          <form onSubmit={handleSubmit} className="mt-12">
            <div className="brand-panel-fade" style={{ "--fd": "180ms" }}>
              <label
                htmlFor="senha"
                className="block text-[11px] font-medium uppercase tracking-[0.18em] text-brand-preto/65"
              >
                Senha
              </label>

              <div className="relative mt-3">
                <input
                  id="senha"
                  type="password"
                  autoFocus
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="peer w-full bg-transparent pb-3 text-lg tracking-[0.18em] text-brand-preto outline-none placeholder:tracking-normal placeholder:text-brand-preto/25"
                  placeholder="••••••••"
                />
                {/* A linha do campo escurece e engrossa quando ele recebe foco. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px bg-brand-preto/20"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand-preto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus:scale-x-100"
                />
              </div>

              {erro && (
                <p className="mt-3 text-sm text-[#9b3b2e]" role="alert">
                  {erro}
                </p>
              )}

              {/* Pílula justa no computador e largura cheia no celular, onde
                  o alvo maior ajuda. Altura de 44px nos dois casos — o mínimo
                  recomendado para toque e clique. A largura mínima evita que
                  o botão mude de tamanho ao virar "Entrando...". */}
              <button
                type="submit"
                disabled={entrando}
                className="mt-8 w-full min-w-[9.5rem] rounded-full bg-brand-preto px-10 py-3 text-sm font-medium tracking-[0.06em] text-brand-areia transition duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-preto active:translate-y-px disabled:opacity-50 sm:w-auto"
              >
                {entrando ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>

          <p
            className="brand-panel-fade mt-10 text-xs leading-relaxed text-brand-preto/65"
            style={{ "--fd": "280ms" }}
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
