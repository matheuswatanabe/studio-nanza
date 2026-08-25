"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Clientes", href: "/clientes" },
  { label: "Projetos", href: "/projetos" },
  { label: "Financeiro", href: "/financeiro" },
  { label: "Configurações", href: "/configuracoes" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
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

      <div className="border-t border-neutral-200 px-6 py-4 text-xs text-neutral-400">
        Dados salvos localmente
      </div>
    </aside>
  );
}
