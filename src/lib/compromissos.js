import { sql } from "@/lib/db";
import { ehDataISO, ehHoraISO, VALORES_COR } from "@/lib/agenda";

// Busca compromissos sempre com as mesmas colunas normalizadas: as horas
// voltam como "HH:MM" (o formato que o <input type="time"> usa) em vez do
// "HH:MM:SS" cru do Postgres, e a data como "AAAA-MM-DD" (garantido pelo
// parser de `date` configurado em lib/db.js). As colunas são listadas uma a
// uma de propósito — com `compromissos.*` os to_char virariam nomes
// duplicados no resultado.
export async function listarCompromissos({ id, de, ate } = {}) {
  return sql`
    SELECT
      compromissos.id,
      compromissos.titulo,
      compromissos.descricao,
      compromissos.data,
      to_char(compromissos.hora_inicio, 'HH24:MI') AS hora_inicio,
      to_char(compromissos.hora_fim, 'HH24:MI') AS hora_fim,
      compromissos.dia_inteiro,
      compromissos.local,
      compromissos.cor,
      compromissos.projeto_id,
      compromissos.concluido,
      compromissos.criado_por,
      compromissos.criado_em,
      compromissos.atualizado_em,
      compromissos.google_event_id,
      compromissos.google_calendar_id,
      compromissos.google_erro,
      projetos.nome AS projeto_nome
    FROM compromissos
    LEFT JOIN projetos ON projetos.id = compromissos.projeto_id
    WHERE (${id ?? null}::int IS NULL OR compromissos.id = ${id ?? null})
      AND (${de ?? null}::date IS NULL OR compromissos.data >= ${de ?? null})
      AND (${ate ?? null}::date IS NULL OR compromissos.data <= ${ate ?? null})
    ORDER BY
      compromissos.data ASC,
      compromissos.dia_inteiro DESC,
      compromissos.hora_inicio ASC NULLS FIRST,
      compromissos.id ASC
  `;
}

// Valida e normaliza o corpo enviado pela página. Devolve { erro } ou
// { valores } — mesmo formato usado nas rotas de transações.
export function validarCompromisso(body) {
  const titulo = (body.titulo ?? "").trim();
  const descricao = (body.descricao ?? "").trim() || null;
  const data = (body.data ?? "").trim();
  const local = (body.local ?? "").trim() || null;
  const cor = (body.cor ?? "azul").trim();
  const diaInteiro = Boolean(body.dia_inteiro);
  const projetoId = body.projeto_id ? Number(body.projeto_id) : null;
  const concluido = Boolean(body.concluido);

  // Num compromisso de dia inteiro as horas são descartadas, para o banco
  // nunca guardar um horário que a interface não mostra.
  const horaInicio = diaInteiro ? null : (body.hora_inicio ?? "").trim() || null;
  const horaFim = diaInteiro ? null : (body.hora_fim ?? "").trim() || null;

  if (!titulo) return { erro: "O título do compromisso é obrigatório." };
  if (titulo.length > 140) return { erro: "O título deve ter no máximo 140 caracteres." };
  if (!ehDataISO(data)) return { erro: "Informe uma data válida para o compromisso." };
  if (!VALORES_COR.includes(cor)) return { erro: "Cor inválida." };

  if (!diaInteiro) {
    if (!horaInicio) return { erro: "Informe a hora de início ou marque “dia inteiro”." };
    if (!ehHoraISO(horaInicio)) return { erro: "Hora de início inválida." };
    if (horaFim && !ehHoraISO(horaFim)) return { erro: "Hora de término inválida." };
    if (horaFim && horaFim <= horaInicio)
      return { erro: "A hora de término precisa ser depois da hora de início." };
  }

  if (projetoId !== null && !Number.isInteger(projetoId))
    return { erro: "Projeto inválido." };

  return {
    valores: {
      titulo,
      descricao,
      data,
      horaInicio,
      horaFim,
      diaInteiro,
      local,
      cor,
      projetoId,
      concluido,
    },
  };
}

// Confere se o projeto vinculado existe antes de gravar — sem isso o erro
// viraria uma violação de chave estrangeira crua na resposta da API.
export async function projetoExiste(projetoId) {
  if (!projetoId) return true;
  const [projeto] = await sql`SELECT id FROM projetos WHERE id = ${projetoId}`;
  return Boolean(projeto);
}
