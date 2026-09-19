"use client";

import { useEffect, useRef, useState } from "react";

const MENSAGEM_RETORNO = {
  conectado: "Conta Google conectada. Enviando os compromissos para a agenda “Studio Nanza”...",
  cancelado: "Conexão cancelada — nada foi alterado.",
  "nao-configurado":
    "As credenciais do Google ainda não foram configuradas no servidor (GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET).",
};

function BotaoCopiar({ texto, rotulo = "Copiar" }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Alguns navegadores bloqueiam a área de transferência fora de HTTPS.
      // O campo ao lado continua selecionável para copiar na mão.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
    >
      {copiado ? "Copiado!" : rotulo}
    </button>
  );
}

function CampoCopiavel({ valor, rotulo }) {
  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        readOnly
        value={valor}
        onFocus={(e) => e.target.select()}
        aria-label={rotulo}
        className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 outline-none"
      />
      <BotaoCopiar texto={valor} />
    </div>
  );
}

function SeloStatus({ google }) {
  if (!google) return null;

  const [texto, estilo] = !google.configurado
    ? ["Não configurado", "bg-neutral-100 text-neutral-500"]
    : google.erro
      ? ["Precisa reconectar", "bg-red-100 text-red-700"]
      : google.conectado
        ? ["Conectado", "bg-emerald-100 text-emerald-700"]
        : ["Não conectado", "bg-neutral-100 text-neutral-600"];

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${estilo}`}>
      {texto}
    </span>
  );
}

export default function PainelSincronizacao({ urlFeed, google, retornoGoogle, onAtualizar }) {
  const [aberto, setAberto] = useState(Boolean(retornoGoogle?.status));
  const [mostrarOutras, setMostrarOutras] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [desconectando, setDesconectando] = useState(false);
  const [mensagem, setMensagem] = useState(() =>
    retornoGoogle?.status === "erro"
      ? { tipo: "erro", texto: retornoGoogle.motivo ?? "Não foi possível conectar." }
      : MENSAGEM_RETORNO[retornoGoogle?.status]
        ? { tipo: "info", texto: MENSAGEM_RETORNO[retornoGoogle.status] }
        : null
  );

  // Se a pessoa acabou de voltar do Google, os compromissos que já existiam
  // antes da conexão ainda não estão lá — envia tudo automaticamente.
  const envioAutomaticoFeito = useRef(false);
  useEffect(() => {
    if (
      retornoGoogle?.status === "conectado" &&
      google?.conectado &&
      !envioAutomaticoFeito.current
    ) {
      envioAutomaticoFeito.current = true;
      enviarPendentes();
    }
  }, [retornoGoogle?.status, google?.conectado]);

  async function enviarPendentes() {
    setEnviando(true);
    let enviados = 0;
    let falhas = 0;
    let erroDaConta = null;

    // O servidor envia em lotes pequenos (para caber no tempo de uma função
    // da Vercel); aqui repete até acabar. O teto é só uma trava de segurança.
    for (let rodada = 0; rodada < 30; rodada++) {
      const res = await fetch("/api/google/enviar", { method: "POST" });
      if (!res.ok) {
        erroDaConta = "O servidor não conseguiu enviar agora. Tente de novo em instantes.";
        break;
      }
      const resultado = await res.json();
      enviados += resultado.enviados;
      falhas += resultado.falhas;
      setMensagem({ tipo: "info", texto: `Enviando... ${enviados} compromisso(s) enviados.` });
      if (resultado.erro) erroDaConta = resultado.erro;
      if (resultado.erro || resultado.restantes === 0) break;
    }

    setEnviando(false);

    if (erroDaConta) {
      setMensagem({ tipo: "erro", texto: erroDaConta });
    } else if (falhas > 0) {
      setMensagem({
        tipo: "erro",
        texto: `${enviados} enviado(s), ${falhas} com falha. Abra os compromissos marcados como “não sincronizado” para ver o motivo.`,
      });
    } else {
      setMensagem({
        tipo: "ok",
        texto:
          enviados > 0
            ? `Pronto: ${enviados} compromisso(s) enviados para o Google Agenda.`
            : "Tudo em dia: nenhum compromisso pendente.",
      });
    }

    onAtualizar();
  }

  async function desconectar() {
    if (
      !window.confirm(
        "Desconectar a conta Google? Os compromissos já enviados continuam no Google Agenda, mas os novos deixam de ir para lá."
      )
    )
      return;

    setDesconectando(true);
    await fetch("/api/google", { method: "DELETE" });
    setDesconectando(false);
    setMensagem({ tipo: "info", texto: "Conta Google desconectada." });
    onAtualizar();
  }

  const estiloMensagem = {
    erro: "bg-red-50 text-red-700",
    ok: "bg-emerald-50 text-emerald-800",
    info: "bg-neutral-100 text-neutral-700",
  };

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-neutral-900">
            Google Agenda
          </span>
          <span className="mt-0.5 block truncate text-xs text-neutral-500">
            {google?.conectado && !google.erro
              ? `Cada compromisso salvo aqui aparece no celular em segundos · ${google.email ?? "conta conectada"}`
              : "Faça os compromissos aparecerem no calendário do celular."}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <SeloStatus google={google} />
          <span className="hidden text-xs font-medium text-neutral-500 sm:inline">
            {aberto ? "Fechar" : "Detalhes"}
          </span>
        </span>
      </button>

      {aberto && (
        <div className="border-t border-neutral-200 px-5 py-5 text-sm text-neutral-600">
          {mensagem && (
            <p
              role="status"
              className={`mb-4 rounded-lg px-3 py-2 text-xs leading-relaxed ${estiloMensagem[mensagem.tipo]}`}
            >
              {mensagem.texto}
            </p>
          )}

          {/* --- Envio instantâneo pela API do Google --- */}
          {!google ? (
            <p className="text-xs text-neutral-400">Verificando a conexão...</p>
          ) : !google.configurado ? (
            <div>
              <p className="font-medium text-neutral-900">
                Envio instantâneo ainda não configurado
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                Falta cadastrar as credenciais do Google no servidor
                (variáveis <code>GOOGLE_CLIENT_ID</code> e{" "}
                <code>GOOGLE_CLIENT_SECRET</code> na Vercel). No Google Cloud,
                use este endereço como “URI de redirecionamento autorizado”:
              </p>
              <CampoCopiavel
                valor={google.uriDeRetorno}
                rotulo="URI de redirecionamento para cadastrar no Google Cloud"
              />
            </div>
          ) : !google.conectado || google.erro ? (
            <div>
              <p className="font-medium text-neutral-900">
                {google.erro ? "A conexão com o Google caiu" : "Conectar uma conta Google"}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                {google.erro
                  ? google.erro
                  : "O site cria uma agenda chamada “Studio Nanza” nessa conta e passa a publicar ali cada compromisso salvo. O acesso é só a essa agenda — o site não enxerga nem altera as outras."}
              </p>
              <a
                href="/api/google/conectar"
                className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              >
                {google.erro ? "Reconectar conta Google" : "Conectar conta Google"}
              </a>
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-neutral-500 hover:text-neutral-800">
                  O Google mostrou “redirect_uri_mismatch”?
                </summary>
                <p className="mt-2 leading-relaxed">
                  O endereço abaixo precisa estar cadastrado{" "}
                  <strong>exatamente igual</strong> no Google Cloud, em Clientes →
                  “URIs de redirecionamento autorizados”. Ele muda conforme o
                  domínio pelo qual você abriu o site — use sempre o mesmo.
                </p>
                <CampoCopiavel
                  valor={google.uriDeRetorno}
                  rotulo="URI de redirecionamento para cadastrar no Google Cloud"
                />
              </details>
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                O Google vai mostrar um aviso de “app não verificado”. É esperado:
                o app é de uso interno do studio e não passou pela revisão
                pública do Google. Clique em <strong>Avançado</strong> →{" "}
                <strong>Acessar</strong> e depois deixe marcada a permissão da
                agenda.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-neutral-900">
                Conectado{google.email ? ` como ${google.email}` : ""}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                Os compromissos vão para a agenda <strong>“Studio Nanza”</strong>{" "}
                dessa conta assim que são salvos, movidos ou apagados aqui.
                {google.conectadoPor ? ` Conectado por ${google.conectadoPor}.` : ""}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={enviarPendentes}
                  disabled={enviando}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {enviando
                    ? "Enviando..."
                    : google.pendentes > 0
                      ? `Enviar ${google.pendentes} pendente(s)`
                      : "Reenviar pendentes"}
                </button>
                <button
                  type="button"
                  onClick={desconectar}
                  disabled={desconectando || enviando}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {desconectando ? "Desconectando..." : "Desconectar"}
                </button>
              </div>

              <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                <li>
                  Para aparecer no celular do resto da equipe: no Google Agenda,
                  abra as configurações da agenda “Studio Nanza” →{" "}
                  <strong>Compartilhar com pessoas específicas</strong> e adicione
                  o e-mail de cada um. Agenda compartilhada atualiza na hora.
                </li>
                <li>
                  Se alguém assinou a agenda pelo endereço (.ics) antes, remova
                  aquela assinatura no Google para não ver tudo duplicado.
                </li>
                <li>
                  É mão única: editar o evento direto no Google não volta para
                  o site — e a próxima edição feita aqui sobrescreve lá.
                </li>
              </ul>
            </div>
          )}

          {/* --- Outras formas, sem conta conectada --- */}
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <button
              type="button"
              onClick={() => setMostrarOutras((v) => !v)}
              aria-expanded={mostrarOutras}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
            >
              {mostrarOutras ? "▾" : "▸"} Outras formas (assinatura por endereço, sem conectar conta)
            </button>

            {mostrarOutras && (
              <div className="mt-3">
                <p className="text-xs leading-relaxed">
                  Assinar este endereço no Google Agenda (computador → “Outras
                  agendas” → <strong>+</strong> → “De URL”) ou direto no app
                  Calendário do iPhone. Funciona sem configurar nada, mas quem
                  assina decide de quanto em quanto tempo atualiza — no Google,
                  costuma levar horas.
                </p>
                <CampoCopiavel valor={urlFeed} rotulo="Endereço da agenda para assinar" />
                <p className="mt-2 text-xs text-neutral-500">
                  Qualquer pessoa com esse endereço consegue ler a agenda — trate
                  como uma senha. Ele muda sozinho se a senha do sistema for
                  trocada.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
