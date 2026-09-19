"use client";

import { useState } from "react";
import CamposBasicos from "@/components/projetos/CamposBasicos";
import { ENTREGAVEIS_SUGERIDOS } from "@/components/projetos/constantes";

function NovoEntregavelForm({ projetoId, existentes, onAdicionado }) {
  const [nomeCustom, setNomeCustom] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function adicionar(nome) {
    if (!nome.trim() || salvando) return;
    setSalvando(true);
    const res = await fetch(`/api/projetos/${projetoId}/entregaveis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim() }),
    });
    setSalvando(false);
    if (res.ok) {
      setNomeCustom("");
      onAdicionado();
    }
  }

  const nomesExistentes = existentes.map((e) => e.nome);
  const sugestoesDisponiveis = ENTREGAVEIS_SUGERIDOS.filter(
    (s) => !nomesExistentes.includes(s)
  );

  return (
    <div className="mt-2 flex flex-col gap-2">
      {sugestoesDisponiveis.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sugestoesDisponiveis.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => adicionar(s)}
              disabled={salvando}
              className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Outro entregável..."
          value={nomeCustom}
          onChange={(e) => setNomeCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar(nomeCustom);
            }
          }}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-neutral-900"
        />
        <button
          type="button"
          onClick={() => adicionar(nomeCustom)}
          disabled={salvando}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

export default function ProjetoDetalheModal({ projeto, clientes, onFechar, onAtualizado, onExcluido }) {
  const [form, setForm] = useState({
    nome: projeto.nome,
    cliente_empresa: projeto.cliente_nome,
    tipos_servico: projeto.tipos_servico,
    status: projeto.status,
    data_inicio: projeto.data_inicio ?? "",
    prazo_interno: projeto.prazo_interno ?? "",
    prazo_entrega: projeto.prazo_entrega ?? "",
    observacoes: projeto.observacoes ?? "",
  });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    setErro("");
    setSalvando(true);
    const res = await fetch(`/api/projetos/${projeto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSalvando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível salvar as alterações.");
      return;
    }

    onAtualizado();
  }

  async function excluir() {
    const confirmado = window.confirm(
      `Excluir o projeto "${projeto.nome}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setExcluindo(true);
    const res = await fetch(`/api/projetos/${projeto.id}`, {
      method: "DELETE",
    });
    setExcluindo(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível excluir o projeto.");
      return;
    }

    onExcluido();
  }

  async function alternarEntregavel(entregavel) {
    await fetch(`/api/entregaveis/${entregavel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido: !entregavel.concluido }),
    });
    onAtualizado({ manterAberto: true });
  }

  async function excluirEntregavel(id) {
    await fetch(`/api/entregaveis/${id}`, { method: "DELETE" });
    onAtualizado({ manterAberto: true });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Detalhes do projeto
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg px-2 py-1 text-sm text-neutral-400 hover:bg-neutral-100"
          >
            Fechar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CamposBasicos form={form} setForm={setForm} clientes={clientes} />
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-neutral-900">
            Entregáveis
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {projeto.entregaveis.length === 0 && (
              <p className="text-xs text-neutral-400">
                Nenhum entregável adicionado ainda.
              </p>
            )}
            {projeto.entregaveis.map((entregavel) => (
              <div
                key={entregavel.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2"
              >
                <label className="flex flex-1 items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={Boolean(entregavel.concluido)}
                    onChange={() => alternarEntregavel(entregavel)}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span
                    className={
                      entregavel.concluido
                        ? "line-through text-neutral-400"
                        : ""
                    }
                  >
                    {entregavel.nome}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => excluirEntregavel(entregavel.id)}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <NovoEntregavelForm
            projetoId={projeto.id}
            existentes={projeto.entregaveis}
            onAdicionado={() => onAtualizado({ manterAberto: true })}
          />
        </div>

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {excluindo ? "Excluindo..." : "Excluir projeto"}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
