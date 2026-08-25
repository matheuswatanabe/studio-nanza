"use client";

import { useEffect, useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import { PERFIS } from "@/lib/auth";

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

const MESES = [
  { valor: "01", label: "Janeiro" },
  { valor: "02", label: "Fevereiro" },
  { valor: "03", label: "Março" },
  { valor: "04", label: "Abril" },
  { valor: "05", label: "Maio" },
  { valor: "06", label: "Junho" },
  { valor: "07", label: "Julho" },
  { valor: "08", label: "Agosto" },
  { valor: "09", label: "Setembro" },
  { valor: "10", label: "Outubro" },
  { valor: "11", label: "Novembro" },
  { valor: "12", label: "Dezembro" },
];

function statusReal(t) {
  if (t.status_pagamento !== "pendente") return t.status_pagamento;
  // Enquanto o projeto vinculado não estiver "Finalizado", o pagamento fica
  // como pendente — não faz sentido marcar como atrasado algo de um projeto
  // ainda em andamento só porque a data de início já passou.
  if (t.projeto_id && t.projeto_status !== "Finalizado") return "pendente";
  if (t.data < hojeISO()) return "atrasado";
  return "pendente";
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
  const [filtroFuncionario, setFiltroFuncionario] = useState("todos");
  const [filtroAno, setFiltroAno] = useState(() => hojeISO().slice(0, 4));
  const [filtroMes, setFiltroMes] = useState(() => hojeISO().slice(5, 7));
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

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

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(transacoes.map((t) => t.data.slice(0, 4)));
    anos.add(hojeISO().slice(0, 4));
    return Array.from(anos).sort((a, b) => b.localeCompare(a));
  }, [transacoes]);

  const transacoesDoPeriodo = useMemo(() => {
    return transacoes.filter((t) => {
      const combinaAno = filtroAno === "todos" || t.data.slice(0, 4) === filtroAno;
      const combinaMes = filtroMes === "todos" || t.data.slice(5, 7) === filtroMes;
      const combinaInicio = !dataInicio || t.data >= dataInicio;
      const combinaFim = !dataFim || t.data <= dataFim;
      return combinaAno && combinaMes && combinaInicio && combinaFim;
    });
  }, [transacoes, filtroAno, filtroMes, dataInicio, dataFim]);

  const periodoAtivo =
    filtroAno !== "todos" || filtroMes !== "todos" || dataInicio || dataFim;

  const resumo = useMemo(() => {
    const entradasTotais = transacoes.filter((t) => t.tipo === "entrada");
    const saidasTotais = transacoes.filter((t) => t.tipo === "saida");

    const saldo =
      entradasTotais.reduce((s, t) => s + t.valor, 0) -
      saidasTotais.reduce((s, t) => s + t.valor, 0);

    const aReceber = entradasTotais
      .filter((t) => t.status_pagamento === "pendente")
      .reduce((s, t) => s + t.valor, 0);

    const aPagar = saidasTotais
      .filter((t) => t.status_pagamento === "pendente")
      .reduce((s, t) => s + t.valor, 0);

    const entradasPeriodo = transacoesDoPeriodo.filter((t) => t.tipo === "entrada");
    const saidasPeriodo = transacoesDoPeriodo.filter((t) => t.tipo === "saida");

    const receitaMes = entradasPeriodo.reduce((s, t) => s + t.valor, 0);
    const despesaMes = saidasPeriodo.reduce((s, t) => s + t.valor, 0);

    return {
      saldo,
      aReceber,
      aPagar,
      receitaMes,
      despesaMes,
      lucroMes: receitaMes - despesaMes,
    };
  }, [transacoes, transacoesDoPeriodo]);

  const transacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return transacoesDoPeriodo.filter((t) => {
      const combinaBusca = !termo || t.descricao.toLowerCase().includes(termo);
      const combinaTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      const combinaStatus =
        filtroStatus === "todos" || statusReal(t) === filtroStatus;
      const combinaFuncionario =
        filtroFuncionario === "todos" || t.funcionario === filtroFuncionario;
      return combinaBusca && combinaTipo && combinaStatus && combinaFuncionario;
    });
  }, [transacoesDoPeriodo, busca, filtroTipo, filtroStatus, filtroFuncionario]);

  function limparFiltroPeriodo() {
    setFiltroAno("todos");
    setFiltroMes("todos");
    setDataInicio("");
    setDataFim("");
  }

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

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Fluxo de caixa do período selecionado
        </p>
      </div>

      {!carregando && transacoes.length > 0 && (
        <div className="mt-2 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">Ano</label>
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            >
              <option value="todos">Todos os anos</option>
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">Mês</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            >
              <option value="todos">Todos os meses</option>
              {MESES.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          {periodoAtivo && (
            <button
              type="button"
              onClick={limparFiltroPeriodo}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Limpar período
            </button>
          )}
        </div>
      )}

      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Receita do período</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {formatarMoeda(resumo.receitaMes)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Despesas do período</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {formatarMoeda(resumo.despesaMes)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium text-neutral-500">Lucro do período</p>
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
          <select
            value={filtroFuncionario}
            onChange={(e) => setFiltroFuncionario(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          >
            <option value="todos">Todos os funcionários</option>
            {PERFIS.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfil}
              </option>
            ))}
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
                    <div className="flex items-center gap-2">
                      <span>{t.descricao}</span>
                      <Avatar nome={t.criado_por} />
                    </div>
                    <p className="text-xs font-normal text-neutral-400">
                      {(t.projeto_nome
                        ? [t.projeto_nome, t.cliente_empresa]
                        : [t.categoria]
                      )
                        .concat(t.funcionario ? [`Pagamento: ${t.funcionario}`] : [])
                        .filter(Boolean)
                        .join(" · ")}
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
