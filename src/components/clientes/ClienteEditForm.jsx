"use client";

import { useState } from "react";

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

export default function ClienteEditForm({ cliente, onSalvar, onCancelar, salvando, erro }) {
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
