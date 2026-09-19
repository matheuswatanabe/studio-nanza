// Integração com o Google Agenda pela API oficial: cada compromisso salvo no
// site é publicado na hora numa agenda "Studio Nanza" da conta Google
// conectada — e de lá o próprio Google empurra para os celulares em segundos,
// sem esperar a atualização lenta de agendas assinadas por URL.
//
// Tudo aqui é inerte até alguém conectar uma conta: sem GOOGLE_CLIENT_ID e
// GOOGLE_CLIENT_SECRET, ou sem conta conectada, as funções de espelhamento
// simplesmente não fazem nada e a agenda funciona como antes.
//
// Não usa a biblioteca `googleapis` de propósito: ela é pesada para um
// punhado de chamadas REST, e aqui só precisamos de token, agenda e eventos.
import { sql } from "@/lib/db";
import { listarCompromissos } from "@/lib/compromissos";
import {
  FUSO,
  detalhesDoCompromisso,
  hojeISO,
  intervaloDoCompromisso,
  somarDias,
} from "@/lib/agenda";

// Escopo mínimo possível: o site só consegue criar agendas próprias e mexer
// nos eventos DELAS. Não enxerga nem altera nenhuma outra agenda da conta.
// `openid email` servem só para mostrar qual conta está conectada.
const ESCOPOS = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.app.created",
];
const ESCOPO_AGENDA = "https://www.googleapis.com/auth/calendar.app.created";

const NOME_AGENDA = "Studio Nanza";

// Se o Google demorar, o compromisso já está salvo no banco — melhor desistir
// do envio (fica como pendente, dá para reenviar) do que travar o salvamento
// ou estourar o tempo máximo da função na Vercel.
const TEMPO_LIMITE_MS = 8000;

// Cores de evento do Google Agenda (colorId) mais próximas das da agenda.
const COR_GOOGLE = {
  azul: "9", // Mirtilo
  verde: "10", // Manjericão
  ambar: "5", // Banana
  vermelho: "11", // Tomate
  roxo: "3", // Uva
  grafite: "8", // Grafite
};

export const COOKIE_ESTADO_GOOGLE = "studio_google_estado";

export function googleConfigurado() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function uriDeRetorno(origem) {
  return `${origem}/api/google/callback`;
}

class ErroGoogle extends Error {
  constructor(mensagem, status, codigo) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

/* ------------------------------------------------------------------ */
/* Conexão da conta (OAuth)                                            */
/* ------------------------------------------------------------------ */

export function urlDeAutorizacao({ origem, estado }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: uriDeRetorno(origem),
    response_type: "code",
    scope: ESCOPOS.join(" "),
    // offline + consent: garante que o Google devolva um refresh_token mesmo
    // se a conta já tiver autorizado o site antes.
    access_type: "offline",
    prompt: "consent",
    state: estado,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function pedirToken(parametros) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      ...parametros,
    }),
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ErroGoogle(
      dados.error_description ?? dados.error ?? "Falha ao obter token.",
      res.status,
      dados.error
    );
  }
  return dados;
}

// O e-mail vem dentro do id_token (um JWT). Como ele acabou de chegar direto
// do Google por HTTPS, basta ler o conteúdo — não precisa validar assinatura.
function emailDoIdToken(idToken) {
  try {
    const conteudo = idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(conteudo, "base64").toString("utf8")).email ?? null;
  } catch {
    return null;
  }
}

// Finaliza a conexão depois que a pessoa autorizou no Google: troca o código
// pelos tokens, garante a agenda "Studio Nanza" e grava tudo no banco.
export async function concluirConexao({ codigo, origem, conectadoPor }) {
  const tokens = await pedirToken({
    code: codigo,
    grant_type: "authorization_code",
    redirect_uri: uriDeRetorno(origem),
  });

  // Na tela de consentimento o Google deixa desmarcar permissões uma a uma.
  // Sem a da agenda, a conexão seria inútil — melhor avisar já.
  if (!(tokens.scope ?? "").split(" ").includes(ESCOPO_AGENDA)) {
    throw new ErroGoogle(
      "A permissão de acesso à agenda não foi concedida. Conecte de novo e deixe a caixa da agenda marcada."
    );
  }

  if (!tokens.refresh_token) {
    throw new ErroGoogle("O Google não devolveu um token permanente. Tente conectar de novo.");
  }

  const acesso = tokens.access_token;
  const [anterior] = await sql`SELECT calendario_id FROM integracao_google WHERE id = 1`;

  // Reaproveita a agenda criada numa conexão anterior, se ela ainda existir e
  // pertencer a esta conta. Senão (outra conta, ou agenda apagada), cria uma.
  let calendarioId = null;
  if (anterior?.calendario_id) {
    try {
      await chamarAgenda(`/calendars/${encodeURIComponent(anterior.calendario_id)}`, {
        token: acesso,
      });
      calendarioId = anterior.calendario_id;
    } catch {
      calendarioId = null;
    }
  }

  if (!calendarioId) {
    const agenda = await chamarAgenda("/calendars", {
      method: "POST",
      token: acesso,
      corpo: {
        summary: NOME_AGENDA,
        description: "Compromissos lançados na agenda do site do studio.",
        timeZone: FUSO,
      },
    });
    calendarioId = agenda.id;
  }

  const email = emailDoIdToken(tokens.id_token);

  await sql`
    INSERT INTO integracao_google
      (id, email, refresh_token, calendario_id, conectado_por, conectado_em, erro)
    VALUES (1, ${email}, ${tokens.refresh_token}, ${calendarioId}, ${conectadoPor}, now(), NULL)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      refresh_token = EXCLUDED.refresh_token,
      calendario_id = EXCLUDED.calendario_id,
      conectado_por = EXCLUDED.conectado_por,
      conectado_em = EXCLUDED.conectado_em,
      erro = NULL
  `;

  cacheDeAcesso = { refreshToken: tokens.refresh_token, token: acesso, expiraEm: Date.now() + (tokens.expires_in - 60) * 1000 };

  return { email, calendarioId };
}

export async function desconectar() {
  const integracao = await lerIntegracao();

  if (integracao?.refresh_token) {
    // Revogar do lado do Google tira o acesso de verdade; se falhar (token já
    // inválido, rede), segue desconectando do lado do site mesmo assim.
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: integracao.refresh_token }),
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    }).catch(() => {});
  }

  // Mantém calendario_id para reaproveitar a mesma agenda se reconectar.
  await sql`
    UPDATE integracao_google
    SET refresh_token = NULL, email = NULL, conectado_em = NULL, erro = NULL
    WHERE id = 1
  `;
  cacheDeAcesso = null;
}

/* ------------------------------------------------------------------ */
/* Chamadas à API                                                       */
/* ------------------------------------------------------------------ */

async function lerIntegracao() {
  const [integracao] = await sql`SELECT * FROM integracao_google WHERE id = 1`;
  return integracao ?? null;
}

function conectada(integracao) {
  return Boolean(integracao?.refresh_token && integracao.calendario_id && !integracao.erro);
}

// O token de acesso vale 1 hora. Numa função serverless a memória pode ou não
// sobreviver entre requisições; quando sobrevive, economiza uma ida ao Google.
let cacheDeAcesso = null;

async function tokenDeAcesso(integracao) {
  if (
    cacheDeAcesso?.refreshToken === integracao.refresh_token &&
    cacheDeAcesso.expiraEm > Date.now()
  ) {
    return cacheDeAcesso.token;
  }

  try {
    const dados = await pedirToken({
      refresh_token: integracao.refresh_token,
      grant_type: "refresh_token",
    });
    cacheDeAcesso = {
      refreshToken: integracao.refresh_token,
      token: dados.access_token,
      expiraEm: Date.now() + (dados.expires_in - 60) * 1000,
    };
    return dados.access_token;
  } catch (erro) {
    // invalid_grant = o acesso foi revogado na conta Google (ou expirou).
    // Marca a integração como quebrada para o site parar de tentar a cada
    // salvamento e mostrar "reconecte" no painel. Outros erros (rede, ou
    // invalid_client por credencial errada na Vercel) ficam só no
    // compromisso, porque reconectar a conta não resolveria.
    if (erro.codigo === "invalid_grant") {
      await sql`
        UPDATE integracao_google
        SET erro = 'O Google recusou o acesso — a autorização foi revogada ou expirou. Conecte a conta de novo.'
        WHERE id = 1
      `;
    }
    throw erro;
  }
}

async function chamarAgenda(caminho, { method = "GET", corpo, token }) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${caminho}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(corpo ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });

  if (res.status === 204) return null;

  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ErroGoogle(dados.error?.message ?? `O Google respondeu com erro ${res.status}.`, res.status);
  }
  return dados;
}

function mensagemDeErro(erro) {
  if (erro?.name === "TimeoutError") return "O Google demorou demais para responder.";
  return erro?.message ?? "Erro desconhecido ao falar com o Google.";
}

function eventoDoCompromisso(compromisso) {
  const { diaInteiro, inicio, fim } = intervaloDoCompromisso(compromisso);

  // Campos vazios ficam de fora: como o envio é um PUT (substitui o evento
  // inteiro), apagar o local no site também apaga no Google.
  const detalhes = detalhesDoCompromisso(compromisso);

  return {
    summary: compromisso.concluido ? `✔ ${compromisso.titulo}` : compromisso.titulo,
    ...(detalhes ? { description: detalhes } : {}),
    ...(compromisso.local ? { location: compromisso.local } : {}),
    colorId: COR_GOOGLE[compromisso.cor] ?? COR_GOOGLE.azul,
    start: diaInteiro
      ? { date: inicio.data }
      : { dateTime: `${inicio.data}T${inicio.hora}:00`, timeZone: FUSO },
    end: diaInteiro
      ? { date: fim.data }
      : { dateTime: `${fim.data}T${fim.hora}:00`, timeZone: FUSO },
    // O site é a fonte da verdade: se alguém apagou o evento direto no
    // Google, editar o compromisso aqui traz ele de volta.
    status: "confirmed",
    reminders: { useDefault: true },
    extendedProperties: { private: { studioCompromissoId: String(compromisso.id) } },
  };
}

/* ------------------------------------------------------------------ */
/* Espelhamento usado pelas rotas de compromissos                      */
/* ------------------------------------------------------------------ */

// Publica (ou atualiza) um compromisso no Google e devolve a linha já com o
// estado da sincronização. Nunca lança erro: o compromisso já foi salvo no
// banco, e uma falha do Google vira `google_erro` — visível na tela e
// reenviável — em vez de derrubar o salvamento.
export async function espelharCompromisso(id) {
  const integracao = await lerIntegracao();
  const [compromisso] = await listarCompromissos({ id });

  if (!compromisso || !googleConfigurado() || !conectada(integracao)) {
    return compromisso;
  }

  const calendario = encodeURIComponent(integracao.calendario_id);

  try {
    const token = await tokenDeAcesso(integracao);
    const corpo = eventoDoCompromisso(compromisso);

    // Um evento publicado numa agenda de outra conexão (outra conta Google)
    // não serve mais: publica de novo na agenda atual.
    let eventoId =
      compromisso.google_calendar_id === integracao.calendario_id
        ? compromisso.google_event_id
        : null;
    let evento = null;

    if (eventoId) {
      try {
        evento = await chamarAgenda(
          `/calendars/${calendario}/events/${encodeURIComponent(eventoId)}`,
          { method: "PUT", corpo, token }
        );
      } catch (erro) {
        // 404/410: o evento sumiu do Google (apagado lá) — cria de novo.
        if (erro.status !== 404 && erro.status !== 410) throw erro;
        eventoId = null;
      }
    }

    if (!eventoId) {
      evento = await chamarAgenda(`/calendars/${calendario}/events`, {
        method: "POST",
        corpo,
        token,
      });
    }

    await sql`
      UPDATE compromissos
      SET google_event_id = ${evento.id},
          google_calendar_id = ${integracao.calendario_id},
          google_erro = NULL
      WHERE id = ${id}
    `;
  } catch (erro) {
    await sql`UPDATE compromissos SET google_erro = ${mensagemDeErro(erro)} WHERE id = ${id}`;
  }

  const [atualizado] = await listarCompromissos({ id });
  return atualizado;
}

// Remove do Google um compromisso que acabou de ser apagado no site. Devolve
// uma mensagem de aviso se não conseguiu (o compromisso some do site de
// qualquer jeito — o aviso é para a pessoa apagar lá na mão, se quiser).
export async function removerDoGoogle(compromisso) {
  const integracao = await lerIntegracao();

  if (
    !compromisso?.google_event_id ||
    !googleConfigurado() ||
    !conectada(integracao) ||
    compromisso.google_calendar_id !== integracao.calendario_id
  ) {
    return null;
  }

  try {
    const token = await tokenDeAcesso(integracao);
    await chamarAgenda(
      `/calendars/${encodeURIComponent(integracao.calendario_id)}/events/${encodeURIComponent(
        compromisso.google_event_id
      )}`,
      { method: "DELETE", token }
    );
    return null;
  } catch (erro) {
    if (erro.status === 404 || erro.status === 410) return null; // já não existia
    return `O compromisso foi excluído do site, mas não do Google Agenda (${mensagemDeErro(
      erro
    )}). Apague-o lá manualmente.`;
  }
}

/* ------------------------------------------------------------------ */
/* Status e envio em lote                                              */
/* ------------------------------------------------------------------ */

// Compromissos antigos não precisam ir para o celular: a janela é a mesma
// do feed .ics (90 dias para trás e tudo daqui para frente).
const inicioDaJanela = () => somarDias(hojeISO(), -90);

async function idsPendentes(calendarioId, limite) {
  return sql`
    SELECT id FROM compromissos
    WHERE data >= ${inicioDaJanela()}
      AND (
        google_event_id IS NULL
        OR google_calendar_id IS DISTINCT FROM ${calendarioId}
        OR google_erro IS NOT NULL
      )
    ORDER BY data ASC, id ASC
    ${limite ? sql`LIMIT ${limite}` : sql``}
  `;
}

export async function statusDaIntegracao({ origem }) {
  const base = {
    configurado: googleConfigurado(),
    uriDeRetorno: origem ? uriDeRetorno(origem) : "",
  };

  if (!base.configurado) return { ...base, conectado: false };

  const integracao = await lerIntegracao();
  if (!integracao?.refresh_token) return { ...base, conectado: false };

  const pendentes = await idsPendentes(integracao.calendario_id);

  return {
    ...base,
    conectado: true,
    email: integracao.email,
    conectadoPor: integracao.conectado_por,
    conectadoEm: integracao.conectado_em,
    erro: integracao.erro,
    pendentes: pendentes.length,
  };
}

// Envia um lote de pendentes (nunca enviados, falhados, ou de outra agenda).
// O lote é pequeno para caber folgado no tempo máximo de uma função na
// Vercel; a tela chama de novo enquanto ainda sobrar pendente.
export async function enviarPendentes({ limite = 15 } = {}) {
  const integracao = await lerIntegracao();
  if (!googleConfigurado() || !conectada(integracao)) {
    return { enviados: 0, falhas: 0, restantes: 0, erro: integracao?.erro ?? null };
  }

  const lote = await idsPendentes(integracao.calendario_id, limite);
  let enviados = 0;
  let falhas = 0;

  for (const { id } of lote) {
    const resultado = await espelharCompromisso(id);
    if (resultado?.google_erro) falhas++;
    else enviados++;

    // Se o token caiu no meio do lote, não adianta insistir nos próximos.
    const [atual] = await sql`SELECT erro FROM integracao_google WHERE id = 1`;
    if (atual?.erro) return { enviados, falhas, restantes: 0, erro: atual.erro };
  }

  const restantes = (await idsPendentes(integracao.calendario_id)).length;
  // Se o lote inteiro falhou, parar evita a tela entrar em repetição infinita
  // reenviando os mesmos itens que o Google está recusando.
  return { enviados, falhas, restantes: enviados === 0 && falhas > 0 ? 0 : restantes };
}
