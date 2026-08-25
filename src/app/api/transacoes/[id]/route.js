import { NextResponse } from "next/server";
import { sql, CATEGORIAS_DESPESA, STATUS_PAGAMENTO } from "@/lib/db";

export async function PUT(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM transacoes WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Transação não encontrada." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const descricao = (body.descricao ?? "").trim();
  const valor = Number(body.valor);
  const tipo = body.tipo;
  const data = (body.data ?? "").trim();
  const categoria = (body.categoria ?? "").trim() || null;
  const projetoId = body.projeto_id ? Number(body.projeto_id) : null;
  const statusPagamento = body.status_pagamento || "pago";

  if (!descricao) {
    return NextResponse.json(
      { error: "A descrição é obrigatória." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    return NextResponse.json(
      { error: "Informe um valor maior que zero." },
      { status: 400 }
    );
  }

  if (!["entrada", "saida"].includes(tipo)) {
    return NextResponse.json(
      { error: "Selecione o tipo: Entrada ou Saída." },
      { status: 400 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Informe a data da transação." },
      { status: 400 }
    );
  }

  if (categoria && !CATEGORIAS_DESPESA.includes(categoria)) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  if (!STATUS_PAGAMENTO.includes(statusPagamento)) {
    return NextResponse.json(
      { error: "Status de pagamento inválido." },
      { status: 400 }
    );
  }

  await sql`
    UPDATE transacoes
    SET descricao = ${descricao}, valor = ${valor}, tipo = ${tipo}, data = ${data},
        categoria = ${categoria}, projeto_id = ${projetoId}, status_pagamento = ${statusPagamento}
    WHERE id = ${id}
  `;

  const [transacao] = await sql`
    SELECT transacoes.*, projetos.nome AS projeto_nome,
      COALESCE(clientes.empresa, clientes.nome) AS cliente_empresa
    FROM transacoes
    LEFT JOIN projetos ON projetos.id = transacoes.projeto_id
    LEFT JOIN clientes ON clientes.id = projetos.cliente_id
    WHERE transacoes.id = ${id}
  `;

  return NextResponse.json(transacao);
}

export async function DELETE(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM transacoes WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Transação não encontrada." },
      { status: 404 }
    );
  }

  await sql`DELETE FROM transacoes WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
