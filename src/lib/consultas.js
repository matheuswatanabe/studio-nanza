// Consultas de leitura usadas em dois lugares: nas rotas de API (que a tela
// chama depois de salvar algo, para atualizar a lista) e direto nas páginas,
// que já chegam ao navegador com os dados prontos em vez de abrirem vazias e
// só então pedirem tudo à API. Ficar num lugar só garante que as duas vias
// devolvam exatamente o mesmo formato.
import { sql } from "@/lib/db";

// Agrupa linhas por uma chave mantendo a ordem original — o equivalente a
// um `.filter` por item, mas percorrendo a lista uma vez só.
function agruparPor(linhas, chave) {
  const grupos = new Map();
  for (const linha of linhas) {
    const valor = linha[chave];
    if (!grupos.has(valor)) grupos.set(valor, []);
    grupos.get(valor).push(linha);
  }
  return grupos;
}

export async function listarClientes() {
  const [clientes, projetos, assets] = await Promise.all([
    sql`SELECT * FROM clientes ORDER BY criado_em DESC`,
    sql`SELECT id, nome, cliente_id, status FROM projetos ORDER BY criado_em DESC`,
    sql`SELECT * FROM marca_assets ORDER BY id ASC`,
  ]);

  const projetosPorCliente = agruparPor(projetos, "cliente_id");
  const assetsPorCliente = agruparPor(assets, "cliente_id");

  return clientes.map((cliente) => ({
    ...cliente,
    projetos: projetosPorCliente.get(cliente.id) ?? [],
    assets: assetsPorCliente.get(cliente.id) ?? [],
  }));
}

export async function listarProjetos() {
  const [projetos, entregaveis] = await Promise.all([
    sql`
      SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome
      FROM projetos
      JOIN clientes ON clientes.id = projetos.cliente_id
      ORDER BY
        CASE WHEN projetos.prazo_entrega IS NULL THEN 1 ELSE 0 END,
        projetos.prazo_entrega ASC
    `,
    sql`SELECT * FROM entregaveis ORDER BY id ASC`,
  ]);

  const entregaveisPorProjeto = agruparPor(entregaveis, "projeto_id");

  return projetos.map((projeto) => ({
    ...projeto,
    // Alguns registros antigos guardaram tipos_servico como uma string em
    // vez de um array (jsonb salvo errado). Normaliza aqui para o front
    // nunca quebrar tentando chamar .map/.includes numa string.
    tipos_servico: Array.isArray(projeto.tipos_servico) ? projeto.tipos_servico : [],
    entregaveis: entregaveisPorProjeto.get(projeto.id) ?? [],
  }));
}

export async function listarTransacoes() {
  return sql`
    SELECT transacoes.*, projetos.nome AS projeto_nome, projetos.status AS projeto_status,
      COALESCE(clientes.empresa, clientes.nome) AS cliente_empresa
    FROM transacoes
    LEFT JOIN projetos ON projetos.id = transacoes.projeto_id
    LEFT JOIN clientes ON clientes.id = projetos.cliente_id
    ORDER BY data DESC, transacoes.id DESC
  `;
}

// Deixa os dados no mesmo formato que o navegador recebe da API (datas como
// texto, sem objetos Date). Sem isso, a página carregada direto do servidor
// e a lista recarregada pela API teriam formatos diferentes — e código que
// faz `criado_em.slice(...)` funcionaria num caso e quebraria no outro.
export function comoJson(valor) {
  return JSON.parse(JSON.stringify(valor));
}
