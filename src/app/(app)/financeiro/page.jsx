"use client";

import { useEffect, useMemo, useState } from "react";

const FORM_INICIAL = {
  descricao: "",
  valor: "",
  tipo: "entrada",
  data: "",
  categoria: "",
  projeto_id: "",
  status_pagamento: "pago",
};

const CATEGORIAS_DESPESA = ["Fixa", "Variável"];

const formatarMoeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function statusReal(t) {
  if (t.status_pagamento === "pendente" && t.data < hojeISO()) return "atrasado";
  return t.status_pagamento;
}

const STATUS_ESTILO = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  atrasado: "bg-red-100 text-red-700",
};

const STATUS_LABEL = { pago: "Pago", pendente: "Pendente", atrasado: "Em Atraso" };

function CamposTransacao({ form, setForm, projetos }) {
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

function TransacaoEditForm({ transacao, projetos, onSalvar, onCancelar, salvando, erro }) {
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

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);

  const [editandoId, setEditandoId] = useState(null);
  const [erroEdicao, setErroEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [excluindoId, setExcluindoId] = useState(null);
  const [erroExclusao, setErroExclusao] = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  async function carregarDados() {
    setCarregando(true);
    const [resTransacoes, resProjetos] = await Promise.all([
      fetch("/api/transacoes"),
      fetch("/api/projetos"),
    ]);
    setTransacoes(await resTransacoes.json());
    setProjetos(await resProjetos.json());
    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const mesAtual = hojeISO().slice(0, 7);

    const entradas = transacoes.filter((t) => t.tipo === "entrada");
    const saidas = transacoes.filter((t) => t.tipo === "saida");

    const saldo =
      entradas.reduce((s, t) => s + t.valor, 0) -
      saidas.reduce((s, t) => s + t.valor, 0);

    const aReceber = entradas
      .filter((t) => t.status_pagamento === "pendente")
      .reduce((s, t) => s + t.valor, 0);

    const aPagar = saidas
      .filter((t) => t.status_pagamento === "pendente")
      .reduce((s, t) => s + t.valor, 0);

    const receitaMes = entradas
      .filter((t) => t.data.slice(0, 7) === mesAtual)
      .reduce((s, t) => s + t.valor, 0);

    const despesaMes = saidas
      .filter((t) => t.data.slice(0, 7) === mesAtual)
      .reduce((s, t) => s + t.valor, 0);

    return {
      saldo,
      aReceber,
      aPagar,
      receitaMes,
      despesaMes,
      lucroMes: receitaMes - despesaMes,
    };
  }, [transacoes]);

  const transacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return transacoes.filter((t) => {
      const combinaBusca = !termo || t.descricao.toLowerCase().includes(termo);
      const combinaTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      const combinaStatus =
        filtroStatus === "todos" || statusReal(t) === filtroStatus;
      return combinaBusca && combinaTipo && combinaStatus;
    });
  }, [transacoes, busca, filtroTipo, filtroStatus]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const res = await fetch("/api/transacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: form.valor.replace(",", ".") }),
    });

    setSalvando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível salvar a transação.");
      return;
    }

    setForm(FORM_INICIAL);
    carregarDados();
  }

  function iniciarEdicao(id) {
    setEditandoId(id);
    setErroEdicao("");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setErroEdicao("");
  }

  async function salvarEdicao(id, dadosForm) {
    setErroEdicao("");
    setSalvandoEdicao(true);

    const res = await fetch(`/api/transacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosForm),
    });

    setSalvandoEdicao(false);

    if (!res.ok) {
      const data = await res.json();
      setErroEdicao(data.error ?? "Não foi possível salvar as alterações.");
      return;
    }

    setEditandoId(null);
    carregarDados();
  }

  async function excluirTransacao(id, descricao) {
    const confirmado = window.confirm(
      `Excluir a transação "${descricao}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setErroExclusao(null);
    setExcluindoId(id);

    const res = await fetch(`/api/transacoes/${id}`, { method: "DELETE" });

    setExcluindoId(null);

    if (!res.ok) {
      const data = await res.json();
      setErroExclusao({
        id,
        mensagem: data.error ?? "Não foi possível excluir a transação.",
      });
      return;
    }

    carregarDados();
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Financeiro</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Contas a pagar, a receber e o fluxo de caixa do seu studio.
      </p>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Visão geral
      </p>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Saldo atual</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              resumo.saldo >= 0 ? "text-neutral-900" : "text-red-600"
            }`}
          >
            {formatarMoeda(resumo.saldo)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">
            Total a receber
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {formatarMoeda(resumo.aReceber)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Total a pagar</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {formatarMoeda(resumo.aPagar)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Fluxo de caixa do mês
      </p>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Receita do mês</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {formatarMoeda(resumo.receitaMes)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Despesas do mês</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {formatarMoeda(resumo.despesaMes)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Lucro do mês</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              resumo.lucroMes >= 0 ? "text-neutral-900" : "text-red-600"
            }`}
          >
            {formatarMoeda(resumo.lucroMes)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 items-start gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-3"
      >
        <CamposTransacao form={form} setForm={setForm} projetos={projetos} />

        {erro && <p className="sm:col-span-3 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="sm:col-span-3 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Registrar transação"}
        </button>
      </form>

      {!carregando && transacoes.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por descrição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          >
            <option value="todos">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          >
            <option value="todos">Todos os status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Em Atraso</option>
          </select>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {carregando && (
              <tr>
                <td className="p-5 text-neutral-400" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            )}

            {!carregando && transacoes.length === 0 && (
              <tr>
                <td className="p-5 text-neutral-400" colSpan={6}>
                  Nenhuma transação registrada ainda.
                </td>
              </tr>
            )}

            {!carregando &&
              transacoes.length > 0 &&
              transacoesFiltradas.length === 0 && (
                <tr>
                  <td className="p-5 text-neutral-400" colSpan={6}>
                    Nenhuma transação encontrada com esse filtro.
                  </td>
                </tr>
              )}

            {transacoesFiltradas.map((t) =>
              editandoId === t.id ? (
                <tr key={t.id}>
                  <td className="p-4" colSpan={6}>
                    <TransacaoEditForm
                      transacao={t}
                      projetos={projetos}
                      onSalvar={(dadosForm) => salvarEdicao(t.id, dadosForm)}
                      onCancelar={cancelarEdicao}
                      salvando={salvandoEdicao}
                      erro={erroEdicao}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-neutral-900">
                    {t.descricao}
                    <p className="text-xs font-normal text-neutral-400">
                      {t.projeto_nome
                        ? [t.projeto_nome, t.cliente_empresa]
                            .filter(Boolean)
                            .join(" · ")
                        : t.categoria ?? ""}
                    </p>
                    {erroExclusao?.id === t.id && (
                      <p className="mt-1 text-xs font-normal text-red-600">
                        {erroExclusao.mensagem}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.tipo === "entrada"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_ESTILO[statusReal(t)]
                      }`}
                    >
                      {STATUS_LABEL[statusReal(t)]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {formatarData(t.data)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      t.tipo === "entrada" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {t.tipo === "entrada" ? "+" : "-"} {formatarMoeda(t.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(t.id)}
                        className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluirTransacao(t.id, t.descricao)}
                        disabled={excluindoId === t.id}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {excluindoId === t.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
