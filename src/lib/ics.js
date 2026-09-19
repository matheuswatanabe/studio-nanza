// Gera arquivos .ics (padrão iCalendar, RFC 5545) a partir dos compromissos.
// É o formato que Google Agenda, Apple Calendário e Outlook entendem — tanto
// para assinar a agenda inteira por URL quanto para baixar um compromisso
// avulso e abrir no celular.
import {
  FUSO,
  dataCompacta,
  detalhesDoCompromisso,
  horaCompacta,
  intervaloDoCompromisso,
} from "@/lib/agenda";

// Caracteres com significado especial no formato precisam ser escapados, e a
// quebra de linha vira o literal "\n".
function escapar(texto) {
  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

const codificador = new TextEncoder();

// O formato limita cada linha a 75 octetos; o excedente continua na linha
// seguinte começando com um espaço. A conta é em bytes (não em caracteres)
// porque acento em UTF-8 ocupa 2 — e o corte nunca pode cair no meio de um.
function dobrar(linha) {
  if (codificador.encode(linha).length <= 75) return linha;

  const partes = [];
  let atual = "";
  let octetos = 0;

  for (const caractere of linha) {
    const tamanho = codificador.encode(caractere).length;
    if (octetos + tamanho > 75) {
      partes.push(atual);
      atual = "";
      octetos = 1; // o espaço que abre a linha de continuação conta 1 octeto
    }
    atual += caractere;
    octetos += tamanho;
  }

  partes.push(atual);
  return partes.join("\r\n ");
}

// Carimbo em UTC, usado em DTSTAMP/LAST-MODIFIED.
function carimboUTC(valor) {
  const data = valor instanceof Date ? valor : new Date(valor ?? Date.now());
  const seguro = Number.isNaN(data.getTime()) ? new Date() : data;
  return seguro.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

// O Brasil não usa mais horário de verão desde 2019, então o fuso de Brasília
// é um -03:00 fixo — um único bloco STANDARD descreve corretamente qualquer
// data de hoje em diante, que é o único período que a agenda exporta.
const BLOCO_FUSO = [
  "BEGIN:VTIMEZONE",
  `TZID:${FUSO}`,
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:-0300",
  "TZOFFSETTO:-0300",
  "TZNAME:-03",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function evento(compromisso, { dominio }) {
  const { diaInteiro, inicio, fim } = intervaloDoCompromisso(compromisso);

  const linhas = [
    "BEGIN:VEVENT",
    `UID:compromisso-${compromisso.id}@${dominio}`,
    `DTSTAMP:${carimboUTC(compromisso.atualizado_em ?? compromisso.criado_em)}`,
    `LAST-MODIFIED:${carimboUTC(compromisso.atualizado_em ?? compromisso.criado_em)}`,
  ];

  if (diaInteiro) {
    linhas.push(`DTSTART;VALUE=DATE:${dataCompacta(inicio.data)}`);
    linhas.push(`DTEND;VALUE=DATE:${dataCompacta(fim.data)}`);
  } else {
    linhas.push(
      `DTSTART;TZID=${FUSO}:${dataCompacta(inicio.data)}T${horaCompacta(inicio.hora)}`
    );
    linhas.push(`DTEND;TZID=${FUSO}:${dataCompacta(fim.data)}T${horaCompacta(fim.hora)}`);
  }

  // O título já sinaliza o que foi concluído, porque o padrão iCalendar não
  // tem um "feito" que o Google Agenda exiba em eventos.
  const titulo = compromisso.concluido ? `✔ ${compromisso.titulo}` : compromisso.titulo;
  linhas.push(`SUMMARY:${escapar(titulo)}`);

  const descricao = detalhesDoCompromisso(compromisso);
  if (descricao) linhas.push(`DESCRIPTION:${escapar(descricao)}`);
  if (compromisso.local) linhas.push(`LOCATION:${escapar(compromisso.local)}`);

  linhas.push("END:VEVENT");
  return linhas;
}

export function gerarICS(compromissos, { nome = "Agenda do Studio", dominio = "studio-gestao" } = {}) {
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Studio Gestao//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapar(nome)}`,
    `X-WR-TIMEZONE:${FUSO}`,
    // Pedido de atualização de hora em hora para quem assina a agenda. Nem
    // todo calendário respeita (o Google costuma ir no ritmo dele), mas o
    // Apple Calendário e o Outlook usam.
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    ...BLOCO_FUSO,
    ...compromissos.flatMap((c) => evento(c, { dominio })),
    "END:VCALENDAR",
  ];

  return linhas.map(dobrar).join("\r\n") + "\r\n";
}
