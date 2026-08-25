import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(request, { params }) {
  const id = Number(params.entregavelId);
  const [existente] = await sql`SELECT id FROM entregaveis WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Entregável não encontrado." },
      { status: 404 }
    );
  }

  const body = await request.json();

  const [entregavel] = await sql`
    UPDATE entregaveis SET concluido = ${Boolean(body.concluido)} WHERE id = ${id}
    RETURNING *
  `;

  return NextResponse.json(entregavel);
}

export async function DELETE(request, { params }) {
  const id = Number(params.entregavelId);
  const [existente] = await sql`SELECT id FROM entregaveis WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Entregável não encontrado." },
      { status: 404 }
    );
  }

  await sql`DELETE FROM entregaveis WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
