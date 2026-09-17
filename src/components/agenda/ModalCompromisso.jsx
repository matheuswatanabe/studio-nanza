"use client";

import { useEffect, useRef } from "react";
import { CORES_COMPROMISSO, linkGoogleAgenda } from "@/lib/agenda";
import { estiloDe } from "@/components/agenda/estilos";

export default function ModalCompromisso({
  modo,
  form,
  setForm,
  projetos,
  compromisso,
  salvando,
  excluindo,
  erro,
  onSalvar,
  onExcluir,
  onFechar,
}) {
  const primeiroCampo = useRef(null);

  useEffect(() => {
    primeiroCampo.current?.focus();
  }, []);

  function aoTeclar(e) {
    // Ctrl/Cmd + Enter salva de qualquer campo — a agenda costuma ser
    // preenchida às pressas, entre uma tarefa e outra.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSalvar();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/40 sm:items-center sm:p-4">
      <div aria-hidden onClick={onFechar} className="absolute inset-0" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-compromisso"
        onKeyDown={aoTeclar}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="titulo-modal-compromisso"
            className="text-lg font-semibold text-neutral-900"
          >
            {modo === "criar" ? "Novo compromisso" : "Editar compromisso"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <span className="relative block h-4 w-4">
              <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
              <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
            </span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            ref={primeiroCampo}
            type="text"
            maxLength={140}
            placeholder="Título (ex: Reunião de briefing)"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
          />

          <textarea
            rows={3}
            placeholder="Descrição — o que precisa acontecer, o que levar, links..."
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.dia_inteiro}
              onChange={(e) =>
                setForm({
                  ...form,
                  dia_inteiro: e.target.checked,
                  hora_inicio: e.target.checked ? "" : form.hora_inicio,
                  hora_fim: e.target.checked ? "" : form.hora_fim,
                })
              }
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
            />
            Dia inteiro
          </label>

          {!form.dia_inteiro && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-500">
                  Início
                </label>
                <input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) =>
                    setForm({ ...form, hora_inicio: e.target.value })
                  }
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-500">
                  Término <span className="text-neutral-400">(opcional)</span>
                </label>
                <input
                  type="time"
                  value={form.hora_fim}
                  onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                />
              </div>
            </>
          )}

          <input
            type="text"
            placeholder="Local ou link da chamada"
            value={form.local}
            onChange={(e) => setForm({ ...form, local: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
          />

          <select
            value={form.projeto_id}
            onChange={(e) => setForm({ ...form, projeto_id: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 sm:col-span-2"
          >
            <option value="">Sem projeto vinculado</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <span className="text-xs font-medium text-neutral-500">Cor</span>
            {CORES_COMPROMISSO.map((cor) => {
              const estilo = estiloDe(cor.valor);
              const ativo = form.cor === cor.valor;
              return (
                <button
                  key={cor.valor}
                  type="button"
                  aria-label={cor.rotulo}
                  aria-pressed={ativo}
                  onClick={() => setForm({ ...form, cor: cor.valor })}
                  className={`h-6 w-6 rounded-full ring-offset-2 transition ${estilo.solido} ${
                    ativo ? `ring-2 ${estilo.selecao}` : "hover:opacity-70"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSalvar}
            disabled={salvando}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar compromisso"}
          </button>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Cancelar
          </button>

          {modo === "editar" && (
            <button
              type="button"
              onClick={onExcluir}
              disabled={salvando || excluindo}
              className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </button>
          )}
        </div>

        {modo === "editar" && compromisso && (
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Levar para o celular
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={linkGoogleAgenda(compromisso)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Adicionar ao Google Agenda
              </a>
              <a
                href={`/api/compromissos/${compromisso.id}/ics`}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Baixar .ics
              </a>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Os dois botões usam o que já está gravado — salve as alterações
              antes de usá-los.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
