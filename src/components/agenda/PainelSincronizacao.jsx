"use client";

import { useState } from "react";

export default function PainelSincronizacao({ urlFeed }) {
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(urlFeed);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Alguns navegadores bloqueiam a área de transferência fora de HTTPS.
      // O campo ao lado continua selecionável para copiar na mão.
      setCopiado(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span>
          <span className="block text-sm font-medium text-neutral-900">
            Sincronizar com o Google Agenda
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500">
            Faça os compromissos aparecerem no calendário do celular.
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium text-neutral-500">
          {aberto ? "Fechar" : "Ver como fazer"}
        </span>
      </button>

      {aberto && (
        <div className="border-t border-neutral-200 px-5 py-5 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">
            Opção 1 — assinar a agenda inteira (configura uma vez só)
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed">
            <li>Copie o endereço abaixo.</li>
            <li>
              No computador, abra o Google Agenda, clique no <strong>+</strong>{" "}
              ao lado de “Outras agendas” e escolha <strong>“De URL”</strong>.
            </li>
            <li>Cole o endereço e clique em “Adicionar agenda”.</li>
            <li>
              Pronto: os compromissos passam a aparecer também no aplicativo do
              Google Agenda do celular, sem precisar repetir nada.
            </li>
          </ol>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              readOnly
              value={urlFeed}
              onFocus={(e) => e.target.select()}
              aria-label="Endereço da agenda para assinar"
              className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 outline-none"
            />
            <button
              type="button"
              onClick={copiar}
              className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              {copiado ? "Copiado!" : "Copiar endereço"}
            </button>
          </div>

          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Duas ressalvas importantes: o Google atualiza agendas assinadas no
            ritmo dele — normalmente algumas horas, às vezes até um dia — então
            um compromisso criado agora pode demorar a aparecer no celular por
            essa via. E qualquer pessoa com esse endereço consegue ler a
            agenda, então trate-o como uma senha; ele muda sozinho se a senha
            do sistema for trocada.
          </p>

          <p className="mt-4 font-medium text-neutral-900">
            Opção 2 — mandar um compromisso na hora
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            Abra qualquer compromisso e use{" "}
            <strong>“Adicionar ao Google Agenda”</strong> (abre o Google já
            preenchido e aparece no celular em segundos) ou{" "}
            <strong>“Baixar .ics”</strong>, que funciona em qualquer
            calendário — Google, Apple ou Outlook.
          </p>
        </div>
      )}
    </div>
  );
}
