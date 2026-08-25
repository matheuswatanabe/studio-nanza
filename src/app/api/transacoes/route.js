import { NextResponse } from "next/server";
import { sql, CATEGORIAS_DESPESA, STATUS_PAGAMENTO } from "@/lib/db";
import { perfilAtual } from "@/lib/perfil";

export async function GET() {
  const transacoes = await sql`
    SELECT transacoes.*, projetos.nome AS projeto_nome, projetos.status AS projeto_status,
      COALESCE(clientes.empresa, clientes.nome) AS cliente_empresa
    FROM transacoes
    LEFT JOIN projetos ON projetos.id = transacoes.projeto_id
    LEFT JOIN clientes ON clientes.id = projetos.cliente_id
    ORDER BY data DESC, transacoes.id DESC
  `;
  return NextResponse.json(transacoes);
}

function validar(body) {
  const descricao = (body.descricao ?? "").trim();
  const valor = Number(body.valor);
  const tipo = body.tipo;
  const data = (body.data ?? "").trim();
  const categoria = (body.categoria ?? "").trim() || null;
  const projetoId = body.projeto_id ? Number(body.projeto_id) : null;
  const statusPagamento = body.status_pagamento || "pago";

  if (!descricao) return { erro: "A descrição é obrigatória." };
  if (!Number.isFinite(valor) || valor <= 0)
    return { erro: "Informe um valor maior que zero." };
  if (!["entrada", "saida"].includes(tipo))
    return { erro: "Selecione o tipo: Entrada ou Saída." };
  if (!data) return { erro: "Informe a data da transação." };
  if (categoria && !CATEGORIAS_DESPESA.includes(categoria))
    return { erro: "Categoria inválida." };
  if (!STATUS_PAGAMENTO.includes(statusPagamento))
    return { erro: "Status de pagamento inválido." };

  return {
    valores: { descricao, valor, tipo, data, categoria, projetoId, statusPagamento },
  };
}

export async function POST(request) {
  const body = await request.json();
  const { erro, valores } = validar(body);

  if (erro) {
    return NextResponse.json({ error: erro }, { status: 400 });
  }

  if (valores.projetoId) {
    const [projeto] = await sql`
      SELECT id FROM projetos WHERE id = ${valores.projetoId}
    `;
    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado." },
        { status: 400 }
      );
    }
  }

  const criadoPor = await perfilAtual();

  const [transacaoCriada] = await sql`
    INSERT INTO transacoes (descricao, valor, tipo, data, categoria, projeto_id, status_pagamento, criado_por)
    VALUES (
      ${valores.descricao}, ${valores.valor}, ${valores.tipo}, ${valores.data},
      ${valores.categoria}, ${valores.projetoId}, ${valores.statusPagamento}, ${criadoPor}
    )
    RETURNING *
  `;

  const [transacao] = await sql`
    SELECT transacoes.*, projetos.nome AS projeto_nome, projetos.status AS projeto_status,
      COALESCE(clientes.empresa, clientes.nome) AS cliente_empresa
    FROM transacoes
    LEFT JOIN projetos ON projetos.id = transacoes.projeto_id
    LEFT JOIN clientes ON clientes.id = projetos.cliente_id
    WHERE transacoes.id = ${transacaoCriada.id}
  `;

  return NextResponse.json(transacao, { status: 201 });
}
