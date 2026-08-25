import { NextResponse } from "next/server";
import { sql, STATUS_PROJETO, TIPOS_SERVICO, resolverOuCriarCliente } from "@/lib/db";

export async function PUT(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM projetos WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Projeto não encontrado." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const nome = (body.nome ?? "").trim();
  const clienteEmpresa = (body.cliente_empresa ?? "").trim();
  const clienteId = body.cliente_id ? Number(body.cliente_id) : null;
  const status = body.status ?? "Briefing";
  const tiposServico = Array.isArray(body.tipos_servico) ? body.tipos_servico : [];
  const dataInicio = (body.data_inicio ?? "").trim() || null;
  const prazoInterno = (body.prazo_interno ?? "").trim() || null;
  const prazoEntrega = (body.prazo_entrega ?? "").trim() || null;
  const observacoes = (body.observacoes ?? "").trim() || null;

  if (!nome) {
    return NextResponse.json(
      { error: "O nome do projeto é obrigatório." },
      { status: 400 }
    );
  }

  if (!clienteId && !clienteEmpresa) {
    return NextResponse.json(
      { error: "Informe a empresa do cliente para o projeto." },
      { status: 400 }
    );
  }

  if (!STATUS_PROJETO.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  if (tiposServico.some((t) => !TIPOS_SERVICO.includes(t))) {
    return NextResponse.json(
      { error: "Tipo de serviço inválido." },
      { status: 400 }
    );
  }

  const cliente = await resolverOuCriarCliente({ clienteId, clienteEmpresa });

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 400 }
    );
  }

  await sql`
    UPDATE projetos
    SET nome = ${nome}, cliente_id = ${cliente.id}, tipos_servico = ${sql.json(tiposServico)},
        status = ${status}, data_inicio = ${dataInicio}, prazo_interno = ${prazoInterno},
        prazo_entrega = ${prazoEntrega}, observacoes = ${observacoes}
    WHERE id = ${id}
  `;

  const [projeto] = await sql`
    SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome
    FROM projetos
    JOIN clientes ON clientes.id = projetos.cliente_id
    WHERE projetos.id = ${id}
  `;

  const entregaveis = await sql`
    SELECT * FROM entregaveis WHERE projeto_id = ${id} ORDER BY id ASC
  `;

  return NextResponse.json({ ...projeto, entregaveis });
}

export async function PATCH(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM projetos WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Projeto não encontrado." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const status = body.status;

  if (!STATUS_PROJETO.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  await sql`UPDATE projetos SET status = ${status} WHERE id = ${id}`;

  const [projeto] = await sql`
    SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome
    FROM projetos
    JOIN clientes ON clientes.id = projetos.cliente_id
    WHERE projetos.id = ${id}
  `;

  return NextResponse.json(projeto);
}

export async function DELETE(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM projetos WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Projeto não encontrado." },
      { status: 404 }
    );
  }

  await sql`DELETE FROM projetos WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
