"use client";

import { useEffect, useMemo, useState } from "react";

const FORM_INICIAL = {
  nome: "",
  empresa: "",
  email: "",
  whatsapp: "",
};

const STATUS_ESTILO_PROJETO = {
  Briefing: "bg-neutral-100 text-neutral-600",
  "Em Andamento": "bg-blue-100 text-blue-700",
  "Revisão Externa": "bg-amber-100 text-amber-700",
  Finalizado: "bg-emerald-100 text-emerald-700",
};

function CampoEdicao({ tipo = "text", value, onChange, placeholder }) {
  return (
    <input
      type={tipo}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
    />
  );
}

function ClienteEditForm({ cliente, onSalvar, onCancelar, salvando, erro }) {
  const [form, setForm] = useState({
    nome: cliente.nome,
    empresa: cliente.empresa ?? "",
    email: cliente.email ?? "",
    whatsapp: cliente.whatsapp ?? "",
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <CampoEdicao
        placeholder="Nome do responsável"
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
      />
      <CampoEdicao
        placeholder="Empresa"
        value={form.empresa}
        onChange={(e) => setForm({ ...form, empresa: e.target.value })}
      />
      <CampoEdicao
        tipo="email"
        placeholder="E-mail"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <CampoEdicao
        placeholder="WhatsApp"
        value={form.whatsapp}
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
      />

      {erro && <p className="sm:col-span-2 text-sm text-red-600">{erro}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={() => onSalvar(form)}
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

function NovoAssetForm({ clienteId, onAdicionado }) {
  const [tipo, setTipo] = useState("cor");
  const [rotulo, setRotulo] = useState("");
  const [valor, setValor] = useState("#000000");
  const [valorLink, setValorLink] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function adicionar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const res = await fetch(`/api/clientes/${clienteId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        rotulo,
        valor: tipo === "cor" ? valor : valorLink,
      }),
    });

    setSalvando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível adicionar o ativo.");
      return;
    }

    setRotulo("");
    setValorLink("");
    onAdicionado();
  }

  return (
    <form onSubmit={adicionar} className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
        >
          <option value="cor">Cor</option>
          <option value="link">Link de logo</option>
        </select>
        <input
          type="text"
          placeholder="Rótulo (opcional)"
          value={rotulo}
          onChange={(e) => setRotulo(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-neutral-900"
        />
      </div>

      {tipo === "cor" ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-neutral-300"
          />
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="#000000"
            className="flex-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-neutral-900"
          />
        </div>
      ) : (
        <input
          type="url"
          placeholder="https://..."
          value={valorLink}
          onChange={(e) => setValorLink(e.target.value)}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-neutral-900"
        />
      )}

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="self-start rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
      >
        {salvando ? "Adicionando..." : "Adicionar ativo"}
      </button>
    </form>
  );
}

function DetalhesCliente({ cliente, onMudou }) {
  async function excluirAsset(id) {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    onMudou();
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-4 border-t border-neutral-100 pt-3 sm:grid-cols-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Histórico de projetos
        </p>
        {cliente.projetos.length === 0 ? (
          <p className="mt-1 text-xs text-neutral-400">
            Nenhum projeto cadastrado para este cliente ainda.
          </p>
        ) : (
          <div className="mt-1.5 flex flex-col gap-1.5">
            {cliente.projetos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-2.5 py-1.5"
              >
                <span className="text-xs text-neutral-700">{p.nome}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    STATUS_ESTILO_PROJETO[p.status] ??
                    "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Brand assets
        </p>
        {cliente.assets.length === 0 ? (
          <p className="mt-1 text-xs text-neutral-400">
            Nenhuma cor ou link salvo ainda.
          </p>
        ) : (
          <div className="mt-1.5 flex flex-col gap-1.5">
            {cliente.assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-2.5 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {asset.tipo === "cor" ? (
                    <>
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-neutral-300"
                        style={{ backgroundColor: asset.valor }}
                      />
                      <span className="truncate text-xs text-neutral-700">
                        {asset.rotulo || asset.valor}
                      </span>
                    </>
                  ) : (
                    <a
                      href={asset.valor}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-blue-600 hover:underline"
                    >
                      {asset.rotulo || asset.valor}
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => excluirAsset(asset.id)}
                  className="shrink-0 text-[11px] text-neutral-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <NovoAssetForm clienteId={cliente.id} onAdicionado={onMudou} />
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  const [editandoId, setEditandoId] = useState(null);
  const [erroEdicao, setErroEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [busca, setBusca] = useState("");

  const [excluindoId, setExcluindoId] = useState(null);
  const [erroExclusao, setErroExclusao] = useState(null);

  const [expandidoId, setExpandidoId] = useState(null);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientes.filter((cliente) => {
      return (
        !termo ||
        [cliente.nome, cliente.empresa, cliente.email, cliente.whatsapp]
          .filter(Boolean)
          .some((campo) => campo.toLowerCase().includes(termo))
      );
    });
  }, [clientes, busca]);

  async function carregarClientes() {
    setCarregando(true);
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(data);
    setCarregando(false);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSalvando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? "Não foi possível salvar o cliente.");
      return;
    }

    setForm(FORM_INICIAL);
    carregarClientes();
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

    const res = await fetch(`/api/clientes/${id}`, {
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
    carregarClientes();
  }

  async function excluirCliente(id, nome) {
    const confirmado = window.confirm(
      `Excluir o cliente "${nome}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setErroExclusao(null);
    setExcluindoId(id);

    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });

    setExcluindoId(null);

    if (!res.ok) {
      const data = await res.json();
      setErroExclusao({
        id,
        mensagem: data.error ?? "Não foi possível excluir o cliente.",
      });
      return;
    }

    carregarClientes();
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Clientes</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Cadastre clientes, acompanhe o histórico e guarde os ativos da marca.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Nome do responsável"
          required
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <input
          type="text"
          placeholder="Empresa"
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <input
          type="text"
          placeholder="WhatsApp"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />

        {erro && <p className="sm:col-span-2 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="sm:col-span-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Adicionar cliente"}
        </button>
      </form>

      {!carregando && clientes.length > 0 && (
        <div className="mt-6">
          <input
            type="text"
            placeholder="Buscar por nome, empresa, e-mail ou WhatsApp"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
        </div>
      )}

      <div className="mt-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {carregando && (
          <p className="p-5 text-sm text-neutral-400">Carregando...</p>
        )}

        {!carregando && clientes.length === 0 && (
          <p className="p-5 text-sm text-neutral-400">
            Nenhum cliente cadastrado ainda.
          </p>
        )}

        {!carregando && clientes.length > 0 && clientesFiltrados.length === 0 && (
          <p className="p-5 text-sm text-neutral-400">
            Nenhum cliente encontrado com esse filtro.
          </p>
        )}

        {clientesFiltrados.map((cliente) =>
          editandoId === cliente.id ? (
            <div key={cliente.id} className="p-4">
              <ClienteEditForm
                cliente={cliente}
                onSalvar={(dadosForm) => salvarEdicao(cliente.id, dadosForm)}
                onCancelar={cancelarEdicao}
                salvando={salvandoEdicao}
                erro={erroEdicao}
              />
            </div>
          ) : (
            <div key={cliente.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {cliente.nome}
                  </p>

                  {erroExclusao?.id === cliente.id && (
                    <p className="mt-1 text-xs text-red-600">
                      {erroExclusao.mensagem}
                    </p>
                  )}

                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                        Empresa
                      </span>
                      <span className="text-xs text-neutral-600">
                        {cliente.empresa || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                        E-mail
                      </span>
                      <span className="text-xs text-neutral-600">
                        {cliente.email || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                        WhatsApp
                      </span>
                      <span className="text-xs text-neutral-600">
                        {cliente.whatsapp || "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandidoId(
                        expandidoId === cliente.id ? null : cliente.id
                      )
                    }
                    className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                  >
                    {expandidoId === cliente.id
                      ? "Ocultar histórico e ativos"
                      : `Histórico e ativos (${cliente.projetos.length} projeto${
                          cliente.projetos.length === 1 ? "" : "s"
                        }, ${cliente.assets.length} ativo${
                          cliente.assets.length === 1 ? "" : "s"
                        })`}
                  </button>

                  {expandidoId === cliente.id && (
                    <DetalhesCliente
                      cliente={cliente}
                      onMudou={carregarClientes}
                    />
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(cliente.id)}
                      className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirCliente(cliente.id, cliente.nome)}
                      disabled={excluindoId === cliente.id}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {excluindoId === cliente.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
