import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const clientes = await sql`SELECT * FROM clientes ORDER BY criado_em DESC`;

  const projetos = await sql`
    SELECT id, nome, cliente_id, status FROM projetos ORDER BY criado_em DESC
  `;

  const assets = await sql`SELECT * FROM marca_assets ORDER BY id ASC`;

  const clientesCompletos = clientes.map((cliente) => ({
    ...cliente,
    projetos: projetos.filter((p) => p.cliente_id === cliente.id),
    assets: assets.filter((a) => a.cliente_id === cliente.id),
  }));

  return NextResponse.json(clientesCompletos);
}

export async function POST(request) {
  const body = await request.json();
  const nome = (body.nome ?? "").trim();

  if (!nome) {
    return NextResponse.json(
      { error: "O nome do cliente é obrigatório." },
      { status: 400 }
    );
  }

  const empresa = (body.empresa ?? "").trim() || null;
  const email = (body.email ?? "").trim() || null;
  const whatsapp = (body.whatsapp ?? "").trim() || null;

  const [cliente] = await sql`
    INSERT INTO clientes (nome, empresa, email, whatsapp)
    VALUES (${nome}, ${empresa}, ${email}, ${whatsapp})
    RETURNING *
  `;

  return NextResponse.json(cliente, { status: 201 });
}
