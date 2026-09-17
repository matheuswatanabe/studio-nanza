// As classes do Tailwind precisam aparecer inteiras no código-fonte para
// serem geradas — por isso o mapa traz a string completa de cada cor em vez
// de montar algo como `bg-${cor}-50` em tempo de execução.
export const ESTILO_COR = {
  azul: {
    chip: "bg-blue-50 text-blue-800 ring-blue-200 hover:bg-blue-100",
    ponto: "bg-blue-500",
    solido: "bg-blue-500",
    selecao: "ring-blue-500",
  },
  verde: {
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200 hover:bg-emerald-100",
    ponto: "bg-emerald-500",
    solido: "bg-emerald-500",
    selecao: "ring-emerald-500",
  },
  ambar: {
    chip: "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100",
    ponto: "bg-amber-500",
    solido: "bg-amber-500",
    selecao: "ring-amber-500",
  },
  vermelho: {
    chip: "bg-red-50 text-red-800 ring-red-200 hover:bg-red-100",
    ponto: "bg-red-500",
    solido: "bg-red-500",
    selecao: "ring-red-500",
  },
  roxo: {
    chip: "bg-violet-50 text-violet-800 ring-violet-200 hover:bg-violet-100",
    ponto: "bg-violet-500",
    solido: "bg-violet-500",
    selecao: "ring-violet-500",
  },
  grafite: {
    chip: "bg-neutral-100 text-neutral-700 ring-neutral-300 hover:bg-neutral-200",
    ponto: "bg-neutral-500",
    solido: "bg-neutral-500",
    selecao: "ring-neutral-500",
  },
};

export const estiloDe = (cor) => ESTILO_COR[cor] ?? ESTILO_COR.azul;

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const doisDigitos = (n) => String(n).padStart(2, "0");

export const isoLocal = (data) =>
  `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(
    data.getDate()
  )}`;

const comMaiuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

export function rotuloMes(ano, mes) {
  return comMaiuscula(
    new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  );
}

export function rotuloDia(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return comMaiuscula(
    new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
}

// Sempre 6 semanas, para a grade não mudar de altura ao trocar de mês — um
// calendário que "pula" a cada clique é o que mais atrapalha a navegação.
export function gradeDoMes(ano, mes) {
  const primeiroDoMes = new Date(ano, mes - 1, 1);
  const inicio = new Date(ano, mes - 1, 1 - primeiroDoMes.getDay());

  return Array.from({ length: 6 }, (_, semana) =>
    Array.from({ length: 7 }, (_, diaDaSemana) => {
      const data = new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate() + semana * 7 + diaDaSemana
      );
      return {
        iso: isoLocal(data),
        numero: data.getDate(),
        doMes: data.getMonth() === mes - 1 && data.getFullYear() === ano,
      };
    })
  );
}

export function faixaDeHorario(compromisso) {
  if (compromisso.dia_inteiro || !compromisso.hora_inicio) return "Dia inteiro";
  return compromisso.hora_fim
    ? `${compromisso.hora_inicio} – ${compromisso.hora_fim}`
    : compromisso.hora_inicio;
}
