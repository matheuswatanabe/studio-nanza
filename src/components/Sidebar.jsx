"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Clientes", href: "/clientes" },
  { label: "Projetos", href: "/projetos" },
  { label: "Financeiro", href: "/financeiro" },
  { label: "Configurações", href: "/configuracoes" },
];

function IconeHamburguer({ aberto }) {
  return (
    <span className="relative flex h-4 w-5 shrink-0 flex-col justify-between">
      <span
        className={`h-0.5 w-full rounded-full bg-neutral-700 transition-transform duration-300 ease-in-out ${
          aberto ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full rounded-full bg-neutral-700 transition-opacity duration-200 ease-in-out ${
          aberto ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`h-0.5 w-full rounded-full bg-neutral-700 transition-transform duration-300 ease-in-out ${
          aberto ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export default function Sidebar({ perfil }) {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  // Fecha o menu ao trocar de página e ao apertar Esc — evita o menu
  // ficar "grudado" aberto depois de navegar no mobile/tablet.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100"
        >
          <IconeHamburguer aberto={aberto} />
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          Studio Nanza
        </span>
        <span className="w-9" aria-hidden />
      </div>

      <div
        onClick={() => setAberto(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-neutral-900/40 transition-opacity duration-300 ease-in-out lg:hidden ${
          aberto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6">
          <span className="text-lg font-semibold text-neutral-900">
            Studio
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 px-3 py-4">
          {perfil && (
            <div className="mb-3 flex items-center gap-2 px-3">
              <Avatar nome={perfil} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {perfil}
                </p>
                <Link
                  href="/perfil"
                  className="text-xs text-neutral-400 hover:text-neutral-600 hover:underline"
                >
                  Trocar perfil
                </Link>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={sair}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Sair
          </button>
          <p className="mt-2 px-3 text-xs text-neutral-400">
            Dados salvos com segurança na nuvem
          </p>
        </div>
      </aside>
    </>
  );
}
