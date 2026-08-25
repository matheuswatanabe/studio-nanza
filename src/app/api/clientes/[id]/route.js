import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM clientes WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 404 }
    );
  }

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
    UPDATE clientes
    SET nome = ${nome}, empresa = ${empresa}, email = ${email}, whatsapp = ${whatsapp}
    WHERE id = ${id}
    RETURNING *
  `;

  return NextResponse.json(cliente);
}

export async function DELETE(request, { params }) {
  const id = Number(params.id);
  const [existente] = await sql`SELECT id FROM clientes WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 404 }
    );
  }

  try {
    await sql`DELETE FROM clientes WHERE id = ${id}`;
  } catch (err) {
    if (err.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir este cliente pois há projetos vinculados a ele. Exclua os projetos primeiro.",
        },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
