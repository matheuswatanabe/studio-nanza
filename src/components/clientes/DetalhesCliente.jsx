"use client";

import { useState } from "react";

const STATUS_ESTILO_PROJETO = {
  Briefing: "bg-neutral-100 text-neutral-600",
  "Em Andamento": "bg-blue-100 text-blue-700",
  "Revisão Externa": "bg-amber-100 text-amber-700",
  Finalizado: "bg-emerald-100 text-emerald-700",
};

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

export default function DetalhesCliente({ cliente, onMudou }) {
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
