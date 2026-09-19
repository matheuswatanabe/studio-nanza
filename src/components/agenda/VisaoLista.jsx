"use client";

import { ChipPrazo } from "@/components/agenda/Chips";
import { estiloDe, faixaDeHorario, rotuloDia, rotuloMes } from "@/components/agenda/estilos";

// Visão em lista: o mês agrupado por dia, com descrição e local à mostra.
export default function VisaoLista({
  diasDoMesComItens,
  ano,
  mes,
  hoje,
  setDiaSelecionado,
  setVisao,
  abrirEdicao,
}) {
  return (
    <div className="divide-y divide-neutral-100">
      {diasDoMesComItens.length === 0 ? (
        <p className="px-2 py-16 text-center text-sm text-neutral-400">
          Nenhum compromisso em {rotuloMes(ano, mes).toLowerCase()}.
        </p>
      ) : (
        diasDoMesComItens.map(([iso, itens]) => (
          <div key={iso} className="flex flex-col gap-2 py-4 sm:flex-row sm:gap-5">
            <button
              type="button"
              onClick={() => {
                setDiaSelecionado(iso);
                setVisao("mes");
              }}
              className="w-full shrink-0 text-left sm:w-44"
            >
              <span
                className={`text-sm font-medium ${
                  iso === hoje ? "text-neutral-900" : "text-neutral-600"
                }`}
              >
                {rotuloDia(iso)}
              </span>
              {iso === hoje && (
                <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  hoje
                </span>
              )}
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {itens.compromissos.map((c) => {
                const estilo = estiloDe(c.cor);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => abrirEdicao(c)}
                    className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 text-left transition hover:border-neutral-300"
                  >
                    <span
                      className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${estilo.solido}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-medium text-neutral-900 ${
                          c.concluido ? "line-through text-neutral-400" : ""
                        }`}
                      >
                        {c.titulo}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {faixaDeHorario(c)}
                        {c.local ? ` · ${c.local}` : ""}
                        {c.projeto_nome ? ` · ${c.projeto_nome}` : ""}
                      </span>
                      {c.descricao && (
                        <span className="mt-1 block whitespace-pre-line text-xs text-neutral-500">
                          {c.descricao}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
              {itens.prazos.map((p) => (
                <ChipPrazo key={p.id} prazo={p} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
