import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { perfilAtual } from "@/lib/perfil";
import { listarClientes } from "@/lib/consultas";

export async function GET() {
  return NextResponse.json(await listarClientes());
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

  const criadoPor = await perfilAtual();

  const [cliente] = await sql`
    INSERT INTO clientes (nome, empresa, email, whatsapp, criado_por)
    VALUES (${nome}, ${empresa}, ${email}, ${whatsapp}, ${criadoPor})
    RETURNING *
  `;

  return NextResponse.json(cliente, { status: 201 });
}
