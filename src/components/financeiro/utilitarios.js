export const FORM_INICIAL = {
  descricao: "",
  valor: "",
  tipo: "entrada",
  data: "",
  categoria: "",
  projeto_id: "",
  status_pagamento: "pago",
};

export const CATEGORIAS_DESPESA = ["Fixa", "Variável"];

export const formatarMoeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export const MESES = [
  { valor: "01", label: "Janeiro" },
  { valor: "02", label: "Fevereiro" },
  { valor: "03", label: "Março" },
  { valor: "04", label: "Abril" },
  { valor: "05", label: "Maio" },
  { valor: "06", label: "Junho" },
  { valor: "07", label: "Julho" },
  { valor: "08", label: "Agosto" },
  { valor: "09", label: "Setembro" },
  { valor: "10", label: "Outubro" },
  { valor: "11", label: "Novembro" },
  { valor: "12", label: "Dezembro" },
];

export function statusReal(t) {
  if (t.status_pagamento !== "pendente") return t.status_pagamento;
  // Enquanto o projeto vinculado não estiver "Finalizado", o pagamento fica
  // como pendente — não faz sentido marcar como atrasado algo de um projeto
  // ainda em andamento só porque a data de início já passou.
  if (t.projeto_id && t.projeto_status !== "Finalizado") return "pendente";
  if (t.data < hojeISO()) return "atrasado";
  return "pendente";
}

export const STATUS_ESTILO = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  atrasado: "bg-red-100 text-red-700",
};

export const STATUS_LABEL = { pago: "Pago", pendente: "Pendente", atrasado: "Em Atraso" };
