import { NextResponse } from "next/server";
import { sql, STATUS_PROJETO, TIPOS_SERVICO, resolverOuCriarCliente } from "@/lib/db";
import { perfilAtual } from "@/lib/perfil";

export async function GET() {
  const projetos = await sql`
    SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome
    FROM projetos
    JOIN clientes ON clientes.id = projetos.cliente_id
    ORDER BY
      CASE WHEN projetos.prazo_entrega IS NULL THEN 1 ELSE 0 END,
      projetos.prazo_entrega ASC
  `;

  const entregaveis = await sql`SELECT * FROM entregaveis ORDER BY id ASC`;

  const projetosComEntregaveis = projetos.map((projeto) => ({
    ...projeto,
    entregaveis: entregaveis.filter((e) => e.projeto_id === projeto.id),
  }));

  return NextResponse.json(projetosComEntregaveis);
}

function validarCampos(body) {
  const nome = (body.nome ?? "").trim();
  const clienteEmpresa = (body.cliente_empresa ?? "").trim();
  const clienteId = body.cliente_id ? Number(body.cliente_id) : null;
  const status = body.status ?? "Briefing";
  const tiposServico = Array.isArray(body.tipos_servico) ? body.tipos_servico : [];
  const dataInicio = (body.data_inicio ?? "").trim() || null;
  const prazoInterno = (body.prazo_interno ?? "").trim() || null;
  const prazoEntrega = (body.prazo_entrega ?? "").trim() || null;
  const observacoes = (body.observacoes ?? "").trim() || null;
  const valor = body.valor !== undefined && body.valor !== "" ? Number(body.valor) : null;

  if (!nome) return { erro: "O nome do projeto é obrigatório." };
  if (!clienteId && !clienteEmpresa)
    return { erro: "Informe a empresa do cliente para o projeto." };
  if (!STATUS_PROJETO.includes(status)) return { erro: "Status inválido." };
  if (tiposServico.some((t) => !TIPOS_SERVICO.includes(t)))
    return { erro: "Tipo de serviço inválido." };
  if (valor !== null && (!Number.isFinite(valor) || valor <= 0))
    return { erro: "Informe um valor cobrado maior que zero, ou deixe em branco." };

  return {
    valores: {
      nome,
      clienteEmpresa,
      clienteId,
      status,
      tiposServico,
      dataInicio,
      prazoInterno,
      prazoEntrega,
      observacoes,
      valor,
    },
  };
}

export async function POST(request) {
  const body = await request.json();
  const { erro, valores } = validarCampos(body);

  if (erro) {
    return NextResponse.json({ error: erro }, { status: 400 });
  }

  const criadoPor = await perfilAtual();

  const cliente = await resolverOuCriarCliente({
    clienteId: valores.clienteId,
    clienteEmpresa: valores.clienteEmpresa,
    criadoPor,
  });

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 400 }
    );
  }

  const [projetoCriado] = await sql`
    INSERT INTO projetos
      (nome, cliente_id, tipos_servico, status, data_inicio, prazo_interno, prazo_entrega, observacoes, criado_por)
    VALUES (
      ${valores.nome}, ${cliente.id}, ${sql.json(valores.tiposServico)}, ${valores.status},
      ${valores.dataInicio}, ${valores.prazoInterno}, ${valores.prazoEntrega}, ${valores.observacoes}, ${criadoPor}
    )
    RETURNING *
  `;

  if (valores.valor) {
    await sql`
      INSERT INTO transacoes (descricao, valor, tipo, projeto_id, status_pagamento, data, criado_por)
      VALUES (
        ${"Projeto: " + valores.nome}, ${valores.valor}, 'entrada', ${projetoCriado.id},
        'pendente', ${valores.dataInicio ?? new Date().toISOString().slice(0, 10)}, ${criadoPor}
      )
    `;
  }

  const [projeto] = await sql`
    SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome
    FROM projetos
    JOIN clientes ON clientes.id = projetos.cliente_id
    WHERE projetos.id = ${projetoCriado.id}
  `;

  return NextResponse.json({ ...projeto, entregaveis: [] }, { status: 201 });
}
