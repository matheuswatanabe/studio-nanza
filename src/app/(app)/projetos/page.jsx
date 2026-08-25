"use client";

import { useEffect, useMemo, useState } from "react";

const STATUS_COLUNAS = ["Briefing", "Em Andamento", "Revisão Externa", "Finalizado"];

const STATUS_COR_COLUNA = {
  Briefing: "border-t-neutral-400",
  "Em Andamento": "border-t-blue-400",
  "Revisão Externa": "border-t-amber-400",
  Finalizado: "border-t-emerald-400",
};

const TIPOS_SERVICO = [
  "Identidade Visual",
  "Redesign de Marca",
  "Social Media",
  "Embalagem",
  "Website",
  "Material Gráfico",
];

const TIPO_SERVICO_ESTILO = {
  "Identidade Visual": { badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  "Redesign de Marca": { badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  "Social Media": { badge: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
  Embalagem: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  Website: { badge: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  "Material Gráfico": { badge: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
};

const ENTREGAVEIS_SUGERIDOS = ["Logo", "Manual da Marca", "Papelaria", "Tipografia"];

const FORM_INICIAL = {
  nome: "",
  cliente_empresa: "",
  tipos_servico: [],
  status: "Briefing",
  data_inicio: "",
  prazo_interno: "",
  prazo_entrega: "",
  observacoes: "",
  valor: "",
};

function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function estaAtrasado(projeto) {
  return (
    projeto.prazo_entrega &&
    projeto.status !== "Finalizado" &&
    projeto.prazo_entrega < hojeISO()
  );
}

function alternarServico(lista, servico) {
  return lista.includes(servico)
    ? lista.filter((s) => s !== servico)
    : [...lista, servico];
}

function CamposBasicos({ form, setForm, clientes, mostrarValor = false }) {
  return (
    <>
      <input
        type="text"
        placeholder="Nome do projeto"
        required
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <input
          type="text"
          list="clientes-sugestoes"
          placeholder="Empresa do cliente"
          required
          value={form.cliente_empresa}
          onChange={(e) => setForm({ ...form, cliente_empresa: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <datalist id="clientes-sugestoes">
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.empresa || cliente.nome} />
          ))}
        </datalist>
      </div>

      <div className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-neutral-500">
          Serviços prestados neste projeto
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-3">
          {TIPOS_SERVICO.map((tipo) => (
            <label
              key={tipo}
              className="flex items-center gap-2 text-sm text-neutral-700"
            >
              <input
                type="checkbox"
                checked={form.tipos_servico.includes(tipo)}
                onChange={() =>
                  setForm({
                    ...form,
                    tipos_servico: alternarServico(form.tipos_servico, tipo),
                  })
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              {tipo}
            </label>
          ))}
        </div>
      </div>

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 sm:col-span-2"
      >
        {STATUS_COLUNAS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Data de início
          <input
            type="date"
            value={form.data_inicio}
            onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Prazo interno
          <input
            type="date"
            value={form.prazo_interno}
            onChange={(e) => setForm({ ...form, prazo_interno: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          Entrega ao cliente
          <input
            type="date"
            value={form.prazo_entrega}
            onChange={(e) => setForm({ ...form, prazo_entrega: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-neutral-500 sm:col-span-2">
        Observações e links (Drive, Figma, recados...)
        <textarea
          rows={3}
          value={form.observacoes}
          onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
        />
      </label>

      {mostrarValor && (
        <label className="flex flex-col gap-1 text-xs text-neutral-500 sm:col-span-2">
          Valor cobrado pelo projeto (opcional)
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="R$"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
          <span className="font-normal normal-case text-neutral-400">
            Lança automaticamente uma conta a receber no Financeiro.
          </span>
        </label>
      )}
    </>
  );
}

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

function ProjetoDetalheModal({ projeto, clientes, onFechar, onAtualizado, onExcluido }) {
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

export default function ProjetosPage() {
  const [clientes, setClientes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
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

  useEffect(() => {
    carregarDados();
  }, []);

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
    <div className="mx-auto max-w-7xl px-8 py-10">
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
                        <p className="text-sm font-medium text-neutral-900">
                          {projeto.nome}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {projeto.cliente_nome}
                        </p>

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
