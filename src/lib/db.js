import postgres from "postgres";

const globalForDb = globalThis;

// Importante: não lançar erro aqui se DATABASE_URL estiver ausente. Este
// módulo é carregado durante `next build` (para todas as rotas de API e a
// página inicial), mesmo em ambientes que só vão configurar a variável
// depois (ex: primeiro build no Render antes de preencher o painel). A
// biblioteca "postgres" só abre a conexão de fato na primeira consulta, então
// o erro real aparece na hora de usar o app — não trava o build.

// O restante do app trata datas (prazo, data de vencimento etc.) como texto
// simples "AAAA-MM-DD", igual ao SQLite antes. Sem isso, a lib devolveria
// objetos Date do JavaScript para colunas `date`, quebrando comparações e
// agrupamentos por mês que dependem de fatiar a string diretamente.
const tipoDataComoTexto = {
  to: 1082,
  from: [1082],
  serialize: (valor) => valor,
  parse: (valor) => valor,
};

// Colunas `numeric` (usadas para valores em R$) voltam como string por
// padrão, para não perder precisão em casos extremos — mas o app inteiro
// soma e compara `valor` como número (inclusive somas feitas no navegador
// a partir do JSON da API). Sem isso, "1500.00" + "250.00" viraria uma
// concatenação de texto em vez de uma soma.
const tipoNumericComoNumero = {
  to: 1700,
  from: [1700],
  serialize: (valor) => String(valor),
  parse: (valor) => Number(valor),
};

export const sql =
  globalForDb.__studioSql ??
  postgres(process.env.DATABASE_URL, {
    ssl: "require",
    types: { date: tipoDataComoTexto, numeric: tipoNumericComoNumero },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__studioSql = sql;
}

// Usado ao criar/editar um projeto: aceita o id de um cliente já cadastrado
// ou o nome da empresa digitado/selecionado no campo com sugestões. A busca
// e a criação usam a empresa como identificador principal, com o nome do
// responsável como alternativa para clientes que só têm esse campo
// preenchido. Se não corresponder a nenhum cliente existente, cria um
// cadastro semi-completo (nome = empresa digitada) para que o projeto nunca
// fique bloqueado esperando um cadastro prévio.
export async function resolverOuCriarCliente({ clienteId, clienteEmpresa, criadoPor }) {
  if (clienteId) {
    const [cliente] = await sql`SELECT * FROM clientes WHERE id = ${clienteId}`;
    return cliente ?? null;
  }

  const empresa = (clienteEmpresa ?? "").trim();
  if (!empresa) return null;

  const [existente] = await sql`
    SELECT * FROM clientes
    WHERE lower(COALESCE(empresa, nome)) = lower(${empresa})
  `;
  if (existente) return existente;

  const [criado] = await sql`
    INSERT INTO clientes (nome, empresa, criado_por)
    VALUES (${empresa}, ${empresa}, ${criadoPor ?? null})
    RETURNING *
  `;

  return criado;
}

export const STATUS_PROJETO = [
  "Briefing",
  "Em Andamento",
  "Revisão Externa",
  "Finalizado",
];

export const TIPOS_SERVICO = [
  "Identidade Visual",
  "Redesign de Marca",
  "Social Media",
  "Embalagem",
  "Website",
  "Material Gráfico",
];

export const ENTREGAVEIS_SUGERIDOS = [
  "Logo",
  "Manual da Marca",
  "Papelaria",
  "Tipografia",
];

export const CATEGORIAS_DESPESA = ["Fixa", "Variável"];

export const STATUS_PAGAMENTO = ["pago", "pendente"];
