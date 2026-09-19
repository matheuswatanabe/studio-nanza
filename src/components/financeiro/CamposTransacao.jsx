"use client";

import { useState } from "react";
import { CATEGORIAS_DESPESA } from "@/components/financeiro/utilitarios";

export function CamposTransacao({ form, setForm, projetos }) {
  return (
    <>
      <input
        type="text"
        placeholder="Descrição"
        value={form.descricao}
        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
      />

      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Valor (R$)"
        value={form.valor}
        onChange={(e) => setForm({ ...form, valor: e.target.value })}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />

      <select
        value={form.tipo}
        onChange={(e) =>
          setForm({ ...form, tipo: e.target.value, categoria: "", projeto_id: "" })
        }
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      >
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      {form.tipo === "saida" ? (
        <select
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
        >
          <option value="">Sem categoria</option>
          {CATEGORIAS_DESPESA.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : (
        <select
          value={form.projeto_id}
          onChange={(e) => setForm({ ...form, projeto_id: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
        >
          <option value="">Sem projeto vinculado</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      )}

      <select
        value={form.status_pagamento}
        onChange={(e) => setForm({ ...form, status_pagamento: e.target.value })}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      >
        <option value="pago">Pago</option>
        <option value="pendente">Pendente</option>
      </select>

      <input
        type="date"
        value={form.data}
        onChange={(e) => setForm({ ...form, data: e.target.value })}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      />
    </>
  );
}

export default function TransacaoEditForm({ transacao, projetos, onSalvar, onCancelar, salvando, erro }) {
  const [form, setForm] = useState({
    descricao: transacao.descricao,
    valor: String(transacao.valor),
    tipo: transacao.tipo,
    data: transacao.data,
    categoria: transacao.categoria ?? "",
    projeto_id: transacao.projeto_id ? String(transacao.projeto_id) : "",
    status_pagamento: transacao.status_pagamento,
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <CamposTransacao form={form} setForm={setForm} projetos={projetos} />

      {erro && <p className="sm:col-span-3 text-sm text-red-600">{erro}</p>}

      <div className="flex gap-2 sm:col-span-3">
        <button
          type="button"
          onClick={() =>
            onSalvar({ ...form, valor: form.valor.replace(",", ".") })
          }
          disabled={salvando}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={salvando}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
