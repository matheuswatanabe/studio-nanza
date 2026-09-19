// Constantes e utilitários da agenda compartilhados entre o navegador (a
// página /agenda) e o servidor (rotas de API e geração do arquivo .ics).
// Por isso este arquivo NÃO pode importar nada de "@/lib/db" — se importasse,
// a biblioteca do Postgres iria parar no bundle do navegador.

// Todo o studio trabalha no horário de Brasília. É o fuso usado tanto no
// arquivo .ics quanto no link de "Adicionar ao Google Agenda".
export const FUSO = "America/Sao_Paulo";

// Duração assumida quando o compromisso tem hora de início mas não tem hora
// de fim — calendários (Google, Apple) exigem um fim para desenhar o evento.
export const DURACAO_PADRAO_MIN = 60;

export const CORES_COMPROMISSO = [
  { valor: "azul", rotulo: "Azul" },
  { valor: "verde", rotulo: "Verde" },
  { valor: "ambar", rotulo: "Âmbar" },
  { valor: "vermelho", rotulo: "Vermelho" },
  { valor: "roxo", rotulo: "Roxo" },
  { valor: "grafite", rotulo: "Grafite" },
];

export const VALORES_COR = CORES_COMPROMISSO.map((c) => c.valor);

const doisDigitos = (n) => String(n).padStart(2, "0");

// Data de hoje em "AAAA-MM-DD" usando o relógio local do aparelho. Não dá
// para usar toISOString() aqui: ele converte para UTC e, das 21h em diante
// no Brasil, já devolveria o dia seguinte.
export function hojeISO() {
  const agora = new Date();
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(
    agora.getDate()
  )}`;
}

export function ehDataISO(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [ano, mes, dia] = valor.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

export function ehHoraISO(valor) {
  return typeof valor === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

export function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Soma minutos a um par data+hora tratando as duas partes como números de
// calendário, sem conversão de fuso: Date.UTC é usado só como calculadora de
// dias/horas. O fuso de verdade entra depois, como TZID no .ics e como ctz
// no link do Google.
export function somarMinutos(dataISO, horaISO, minutos) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const [hora, minuto] = horaISO.split(":").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));
  d.setUTCMinutes(d.getUTCMinutes() + minutos);
  return {
    data: d.toISOString().slice(0, 10),
    hora: d.toISOString().slice(11, 16),
  };
}

export function somarDias(dataISO, dias) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// "2026-09-17" -> "20260917" e "14:30" -> "1430", formato exigido tanto pelo
// .ics quanto pelo parâmetro `dates` do link do Google Agenda.
export const dataCompacta = (dataISO) => dataISO.replaceAll("-", "");
export const horaCompacta = (horaISO) => horaISO.replace(":", "") + "00";

// Calcula o intervalo final do compromisso já resolvendo os dois casos que a
// interface permite deixar em aberto: dia inteiro (sem horas) e compromisso
// com início mas sem fim.
export function intervaloDoCompromisso(compromisso) {
  const diaInteiro = compromisso.dia_inteiro || !compromisso.hora_inicio;

  if (diaInteiro) {
    return {
      diaInteiro: true,
      inicio: { data: compromisso.data },
      // No padrão iCalendar o fim de um evento de dia inteiro é exclusivo:
      // um compromisso do dia 17 termina no dia 18.
      fim: { data: somarDias(compromisso.data, 1) },
    };
  }

  const inicio = { data: compromisso.data, hora: compromisso.hora_inicio };
  const fim =
    compromisso.hora_fim && compromisso.hora_fim > compromisso.hora_inicio
      ? { data: compromisso.data, hora: compromisso.hora_fim }
      : somarMinutos(compromisso.data, compromisso.hora_inicio, DURACAO_PADRAO_MIN);

  return { diaInteiro: false, inicio, fim };
}

// Texto que vai no campo de descrição dos calendários externos (.ics e
// Google Agenda): a descrição em si mais o contexto que só existe no site.
export function detalhesDoCompromisso(compromisso) {
  return [
    compromisso.descricao,
    compromisso.projeto_nome && `Projeto: ${compromisso.projeto_nome}`,
    compromisso.criado_por && `Lançado por: ${compromisso.criado_por}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Link "Adicionar ao Google Agenda" — abre o Google já com o formulário do
// evento preenchido. É a via instantânea (aparece no celular em segundos),
// complementar à assinatura do .ics, que o Google atualiza no ritmo dele.
export function linkGoogleAgenda(compromisso) {
  const { diaInteiro, inicio, fim } = intervaloDoCompromisso(compromisso);

  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", compromisso.titulo);

  if (diaInteiro) {
    params.set("dates", `${dataCompacta(inicio.data)}/${dataCompacta(fim.data)}`);
  } else {
    params.set(
      "dates",
      `${dataCompacta(inicio.data)}T${horaCompacta(inicio.hora)}/` +
        `${dataCompacta(fim.data)}T${horaCompacta(fim.hora)}`
    );
    params.set("ctz", FUSO);
  }

  const detalhes = [compromisso.descricao, compromisso.projeto_nome && `Projeto: ${compromisso.projeto_nome}`]
    .filter(Boolean)
    .join("\n\n");
  if (detalhes) params.set("details", detalhes);
  if (compromisso.local) params.set("location", compromisso.local);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
