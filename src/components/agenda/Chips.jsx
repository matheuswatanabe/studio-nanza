"use client";

import Link from "next/link";
import { estiloDe, faixaDeHorario } from "@/components/agenda/estilos";

export function Chip({ compromisso, onAbrir, onArrastar, onFimArrasto, arrastando }) {
  const estilo = estiloDe(compromisso.cor);

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onArrastar(e, compromisso)}
      onDragEnd={onFimArrasto}
      onClick={(e) => {
        e.stopPropagation();
        onAbrir(compromisso);
      }}
      title={`${faixaDeHorario(compromisso)} · ${compromisso.titulo}`}
      className={`flex w-full cursor-grab items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight ring-1 transition active:cursor-grabbing ${
        estilo.chip
      } ${arrastando ? "opacity-40" : ""} ${
        compromisso.concluido ? "line-through opacity-60" : ""
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${estilo.ponto}`} />
      {!compromisso.dia_inteiro && compromisso.hora_inicio && (
        <span className="shrink-0 font-medium tabular-nums">
          {compromisso.hora_inicio}
        </span>
      )}
      <span className="truncate">{compromisso.titulo}</span>
    </button>
  );
}

export function ChipPrazo({ prazo }) {
  return (
    <Link
      href="/projetos"
      onClick={(e) => e.stopPropagation()}
      title={`Entrega do projeto ${prazo.titulo}${
        prazo.cliente_nome ? ` — ${prazo.cliente_nome}` : ""
      }`}
      className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-neutral-300 px-1.5 py-1 text-left text-[11px] leading-tight text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700"
    >
      <span className="shrink-0">◇</span>
      <span className="truncate">{prazo.titulo}</span>
    </Link>
  );
}
