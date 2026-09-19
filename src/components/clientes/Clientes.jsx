"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import ClienteEditForm from "@/components/clientes/ClienteEditForm";
import DetalhesCliente from "@/components/clientes/DetalhesCliente";

const FORM_INICIAL = {
  nome: "",
  empresa: "",
  email: "",
  whatsapp: "",
};

export default function Clientes({ clientesIniciais }) {
  const [clientes, setClientes] = useState(clientesIniciais);
  const [carregando, setCarregando] = useState(false);
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {cliente.nome}
                    </p>
                    <Avatar nome={cliente.criado_por} />
                  </div>

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
