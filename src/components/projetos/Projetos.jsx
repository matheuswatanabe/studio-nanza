"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import CamposBasicos from "@/components/projetos/CamposBasicos";
import ProjetoDetalheModal from "@/components/projetos/ProjetoDetalheModal";
import {
  FORM_INICIAL,
  STATUS_COLUNAS,
  STATUS_COR_COLUNA,
  TIPOS_SERVICO,
  TIPO_SERVICO_ESTILO,
  estaAtrasado,
  formatarData,
} from "@/components/projetos/constantes";

export default function Projetos({ clientesIniciais, projetosIniciais }) {
  const [clientes, setClientes] = useState(clientesIniciais);
  const [projetos, setProjetos] = useState(projetosIniciais);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [formAberto, setFormAberto] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState(null);
  const [arrastandoId, setArrastandoId] = useState(null);

  async function carregarDados() {
    setCarregando(true);
    const [resClientes, resProjetos] = await Promise.all([
      fetch("/api/clientes"),
      fetch("/api/projetos"),
    ]);
    setClientes(await resClientes.json());
    setProjetos(await resProjetos.json());
    setCarregando(false);
  }

  const projetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return projetos.filter((projeto) => {
      const combinaBusca =
        !termo ||
        [projeto.nome, projeto.cliente_nome]
          .filter(Boolean)
          .some((campo) => campo.toLowerCase().includes(termo));

      const combinaTipo =
        filtroTipo === "todos" || projeto.tipos_servico.includes(filtroTipo);

      return combinaBusca && combinaTipo;
    });
  }, [projetos, busca, filtroTipo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const res = await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSalvando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível salvar o projeto.");
      return;
    }

    setForm(FORM_INICIAL);
    setFormAberto(false);
    carregarDados();
  }

  async function moverStatus(projetoId, novoStatus) {
    setProjetos((atual) =>
      atual.map((p) =>
        p.id === projetoId ? { ...p, status: novoStatus } : p
      )
    );

    await fetch(`/api/projetos/${projetoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    carregarDados();
  }

  function fecharModal({ manterAberto } = {}) {
    if (!manterAberto) {
      setProjetoSelecionadoId(null);
    }
    carregarDados();
  }

  const projetoSelecionado = projetos.find((p) => p.id === projetoSelecionadoId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Projetos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Acompanhe o fluxo criativo do studio, do briefing à entrega.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormAberto((v) => !v)}
          className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {formAberto ? "Fechar" : "+ Novo projeto"}
        </button>
      </div>

      {formAberto && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 items-start gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2"
        >
          <CamposBasicos
            form={form}
            setForm={setForm}
            clientes={clientes}
            mostrarValor
            mostrarPagamentos
          />

          {erro && <p className="sm:col-span-2 text-sm text-red-600">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="sm:col-span-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Adicionar projeto"}
          </button>
        </form>
      )}

      {!carregando && projetos.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por projeto ou cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          >
            <option value="todos">Todos os serviços</option>
            {TIPOS_SERVICO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
      )}

      {carregando && (
        <p className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-400">
          Carregando...
        </p>
      )}

      {!carregando && projetos.length === 0 && (
        <p className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-400">
          Nenhum projeto cadastrado ainda.
        </p>
      )}

      {!carregando && projetos.length > 0 && (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUNAS.map((status) => {
            const projetosDaColuna = projetosFiltrados.filter(
              (p) => p.status === status
            );

            return (
              <div
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (arrastandoId) moverStatus(arrastandoId, status);
                  setArrastandoId(null);
                }}
                className={`flex w-72 shrink-0 flex-col rounded-xl border-t-4 bg-neutral-100/60 p-3 ${STATUS_COR_COLUNA[status]}`}
              >
                <div className="flex items-center justify-between px-1 pb-2">
                  <p className="text-sm font-semibold text-neutral-700">
                    {status}
                  </p>
                  <span className="text-xs text-neutral-400">
                    {projetosDaColuna.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {projetosDaColuna.map((projeto) => {
                    const atrasado = estaAtrasado(projeto);
                    const totalEntregaveis = projeto.entregaveis.length;
                    const concluidos = projeto.entregaveis.filter(
                      (e) => e.concluido
                    ).length;

                    return (
                      <div
                        key={projeto.id}
                        draggable
                        onDragStart={() => setArrastandoId(projeto.id)}
                        onClick={() => setProjetoSelecionadoId(projeto.id)}
                        className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm hover:border-neutral-300 ${
                          atrasado ? "border-red-300" : "border-neutral-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900">
                              {projeto.nome}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              {projeto.cliente_nome}
                            </p>
                          </div>
                          <Avatar nome={projeto.criado_por} />
                        </div>

                        {projeto.tipos_servico.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {projeto.tipos_servico.map((tipo) => {
                              const corTipo =
                                TIPO_SERVICO_ESTILO[tipo] ??
                                TIPO_SERVICO_ESTILO["Identidade Visual"];
                              return (
                                <span
                                  key={tipo}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${corTipo.badge}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${corTipo.dot}`} />
                                  {tipo}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span
                            className={
                              atrasado
                                ? "font-medium text-red-600"
                                : "text-neutral-400"
                            }
                          >
                            {atrasado ? "Atrasado · " : ""}
                            {formatarData(projeto.prazo_entrega)}
                          </span>
                          {totalEntregaveis > 0 && (
                            <span className="text-neutral-400">
                              {concluidos}/{totalEntregaveis}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {projetoSelecionado && (
        <ProjetoDetalheModal
          projeto={projetoSelecionado}
          clientes={clientes}
          onFechar={() => setProjetoSelecionadoId(null)}
          onAtualizado={fecharModal}
          onExcluido={() => {
            setProjetoSelecionadoId(null);
            carregarDados();
          }}
        />
      )}
    </div>
  );
}
