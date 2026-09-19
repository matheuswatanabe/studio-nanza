"use client";

import { formatarData } from "@/lib/agenda";
import { Chip, ChipPrazo } from "@/components/agenda/Chips";
import { DIAS_SEMANA } from "@/components/agenda/estilos";

// Grade do mês: 6 semanas × 7 dias, com os compromissos de cada dia,
// arrastar-e-soltar para remarcar e duplo clique para criar.
export default function GradeMes({
  semanas,
  doDia,
  hoje,
  diaSelecionado,
  setDiaSelecionado,
  diaAlvo,
  setDiaAlvo,
  arrastandoId,
  abrirNovo,
  abrirEdicao,
  iniciarArrasto,
  encerrarArrasto,
  soltarNoDia,
}) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 pb-2">
        {DIAS_SEMANA.map((dia) => (
          <span
            key={dia}
            className="px-1 text-center text-[11px] font-medium uppercase tracking-wide text-neutral-400"
          >
            {dia}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {semanas.flat().map((dia) => {
          const itens = doDia(dia.iso);
          const total = itens.compromissos.length + itens.prazos.length;
          const visiveisNoDia = itens.compromissos.slice(0, 3);
          const restantes = total - visiveisNoDia.length;
          const ehHoje = dia.iso === hoje;
          const selecionado = dia.iso === diaSelecionado;

          return (
            <div
              key={dia.iso}
              onClick={() => setDiaSelecionado(dia.iso)}
              onDoubleClick={() => abrirNovo(dia.iso)}
              onDragOver={(e) => {
                if (arrastandoId === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDiaAlvo(dia.iso);
              }}
              onDragLeave={() =>
                setDiaAlvo((atual) => (atual === dia.iso ? null : atual))
              }
              onDrop={(e) => soltarNoDia(e, dia.iso)}
              className={`flex min-h-[5.5rem] cursor-pointer flex-col gap-1 rounded-lg border p-1.5 transition sm:min-h-[7rem] ${
                dia.doMes ? "bg-white" : "bg-neutral-50/60"
              } ${
                diaAlvo === dia.iso
                  ? "border-neutral-900 ring-2 ring-neutral-900/10"
                  : selecionado
                    ? "border-neutral-900"
                    : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium ${
                    ehHoje
                      ? "bg-neutral-900 text-white"
                      : dia.doMes
                        ? "text-neutral-700"
                        : "text-neutral-300"
                  }`}
                >
                  {dia.numero}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirNovo(dia.iso);
                  }}
                  aria-label={`Novo compromisso em ${formatarData(dia.iso)}`}
                  className="flex h-5 w-5 items-center justify-center rounded text-sm text-neutral-300 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  +
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {visiveisNoDia.map((c) => (
                  <Chip
                    key={c.id}
                    compromisso={c}
                    onAbrir={abrirEdicao}
                    onArrastar={iniciarArrasto}
                    onFimArrasto={encerrarArrasto}
                    arrastando={arrastandoId === c.id}
                  />
                ))}
                {visiveisNoDia.length === itens.compromissos.length &&
                  itens.prazos
                    .slice(0, 3 - visiveisNoDia.length)
                    .map((p) => <ChipPrazo key={p.id} prazo={p} />)}
                {restantes > 0 && (
                  <span className="px-1 text-[11px] font-medium text-neutral-400">
                    +{restantes} no dia
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 px-1 text-[11px] text-neutral-400">
        Clique num dia para ver os detalhes ao lado, dois cliques para
        criar. Arraste um compromisso para outro dia para remarcá-lo. As
        setas ← → trocam de mês e a tecla T volta para hoje.
      </p>
    </>
  );
}
