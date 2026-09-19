import { PERFIS } from "@/lib/auth";

export const STATUS_COLUNAS = ["Briefing", "Em Andamento", "Revisão Externa", "Finalizado"];

export const STATUS_COR_COLUNA = {
  Briefing: "border-t-neutral-400",
  "Em Andamento": "border-t-blue-400",
  "Revisão Externa": "border-t-amber-400",
  Finalizado: "border-t-emerald-400",
};

export const TIPOS_SERVICO = [
  "Identidade Visual",
  "Redesign de Marca",
  "Social Media",
  "Embalagem",
  "Website",
  "Material Gráfico",
];

export const TIPO_SERVICO_ESTILO = {
  "Identidade Visual": { badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  "Redesign de Marca": { badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  "Social Media": { badge: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
  Embalagem: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  Website: { badge: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  "Material Gráfico": { badge: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
};

export const ENTREGAVEIS_SUGERIDOS = ["Logo", "Manual da Marca", "Papelaria", "Tipografia"];

export const FORM_INICIAL = {
  nome: "",
  cliente_empresa: "",
  tipos_servico: [],
  status: "Briefing",
  data_inicio: "",
  prazo_interno: "",
  prazo_entrega: "",
  observacoes: "",
  valor: "",
  pagamentos: Object.fromEntries(PERFIS.map((p) => [p, ""])),
};

export function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function estaAtrasado(projeto) {
  return (
    projeto.prazo_entrega &&
    projeto.status !== "Finalizado" &&
    projeto.prazo_entrega < hojeISO()
  );
}

export function alternarServico(lista, servico) {
  return lista.includes(servico)
    ? lista.filter((s) => s !== servico)
    : [...lista, servico];
}
