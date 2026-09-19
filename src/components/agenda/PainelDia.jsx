"use client";

import { ChipPrazo } from "@/components/agenda/Chips";
import { estiloDe, faixaDeHorario, rotuloDia, rotuloMes } from "@/components/agenda/estilos";

// Painel lateral do dia selecionado: lista completa, concluir com um clique
// e atalho para criar compromisso naquele dia.
export default function PainelDia({
  diaSelecionado,
  hoje,
  itensDoDiaSelecionado,
  totalDoMes,
  ano,
  mes,
  abrirNovo,
  abrirEdicao,
  alternarConcluido,
  naoSincronizado,
}) {
  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-4 lg:sticky lg:top-6 lg:self-start">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {diaSelecionado === hoje ? "Hoje" : "Dia selecionado"}
      </p>
      <h2 className="mt-1 text-sm font-semibold text-neutral-900">
        {rotuloDia(diaSelecionado)}
      </h2>

      <button
        type="button"
        onClick={() => abrirNovo(diaSelecionado)}
        className="mt-3 w-full rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50"
      >
        + Adicionar neste dia
      </button>

      <div className="mt-4 flex flex-col gap-2">
        {itensDoDiaSelecionado.compromissos.length === 0 &&
          itensDoDiaSelecionado.prazos.length === 0 && (
            <p className="py-6 text-center text-xs text-neutral-400">
              Nenhum compromisso neste dia.
            </p>
          )}

        {itensDoDiaSelecionado.compromissos.map((c) => {
          const estilo = estiloDe(c.cor);
          return (
            <div
              key={c.id}
              className="flex items-start gap-2 rounded-lg border border-neutral-200 p-2.5"
            >
              <input
                type="checkbox"
                checked={c.concluido}
                onChange={() => alternarConcluido(c)}
                aria-label={`Marcar “${c.titulo}” como concluído`}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-neutral-900"
              />
              <button
                type="button"
                onClick={() => abrirEdicao(c)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${estilo.ponto}`}
                  />
                  <span
                    className={`truncate text-sm font-medium ${
                      c.concluido
                        ? "text-neutral-400 line-through"
                        : "text-neutral-900"
                    }`}
                  >
                    {c.titulo}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {faixaDeHorario(c)}
                  {c.local ? ` · ${c.local}` : ""}
                </span>
                {c.descricao && (
                  <span className="mt-1 block whitespace-pre-line text-xs text-neutral-500">
                    {c.descricao}
                  </span>
                )}
                {c.projeto_nome && (
                  <span className="mr-1 mt-1 inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                    {c.projeto_nome}
                  </span>
                )}
                {naoSincronizado(c) && (
                  <span
                    title={c.google_erro ?? "Ainda não enviado ao Google Agenda"}
                    className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
                  >
                    não sincronizado
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {itensDoDiaSelecionado.prazos.map((p) => (
          <ChipPrazo key={p.id} prazo={p} />
        ))}
      </div>

      <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-400">
        {totalDoMes} compromisso{totalDoMes === 1 ? "" : "s"} em{" "}
        {rotuloMes(ano, mes).toLowerCase()}.
      </p>
    </aside>
  );
}
