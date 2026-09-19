"use client";

import { PERFIS } from "@/lib/auth";
import { STATUS_COLUNAS, TIPOS_SERVICO, alternarServico } from "@/components/projetos/constantes";

export default function CamposBasicos({ form, setForm, clientes, mostrarValor = false, mostrarPagamentos = false }) {
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

      {mostrarPagamentos && (
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-neutral-500">
            Pagamento à equipe neste projeto (opcional)
          </span>
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-3 sm:grid-cols-3">
            {PERFIS.map((perfil) => (
              <label
                key={perfil}
                className="flex flex-col gap-1 text-xs text-neutral-500"
              >
                {perfil}
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="R$"
                  value={form.pagamentos[perfil]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pagamentos: { ...form.pagamentos, [perfil]: e.target.value },
                    })
                  }
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                />
              </label>
            ))}
          </div>
          <span className="mt-1 block font-normal normal-case text-neutral-400">
            Lança automaticamente uma conta a pagar no Financeiro para cada valor preenchido.
          </span>
        </div>
      )}
    </>
  );
}
