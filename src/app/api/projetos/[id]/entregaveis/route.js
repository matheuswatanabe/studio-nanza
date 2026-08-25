import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request, { params }) {
  const projetoId = Number(params.id);
  const [projeto] = await sql`SELECT id FROM projetos WHERE id = ${projetoId}`;

  if (!projeto) {
    return NextResponse.json(
      { error: "Projeto não encontrado." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const nome = (body.nome ?? "").trim();

  if (!nome) {
    return NextResponse.json(
      { error: "Informe o nome do entregável." },
      { status: 400 }
    );
  }

  const [entregavel] = await sql`
    INSERT INTO entregaveis (projeto_id, nome)
    VALUES (${projetoId}, ${nome})
    RETURNING *
  `;

  return NextResponse.json(entregavel, { status: 201 });
}
