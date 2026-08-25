import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request, { params }) {
  const clienteId = Number(params.id);
  const [cliente] = await sql`SELECT id FROM clientes WHERE id = ${clienteId}`;

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const tipo = body.tipo;
  const valor = (body.valor ?? "").trim();
  const rotulo = (body.rotulo ?? "").trim() || null;

  if (!["cor", "link"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  if (!valor) {
    return NextResponse.json(
      {
        error:
          tipo === "cor"
            ? "Informe o código HEX da cor."
            : "Informe o link.",
      },
      { status: 400 }
    );
  }

  if (tipo === "cor" && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(valor)) {
    return NextResponse.json(
      { error: "Informe um código HEX válido (ex: #FF5733)." },
      { status: 400 }
    );
  }

  const [asset] = await sql`
    INSERT INTO marca_assets (cliente_id, tipo, valor, rotulo)
    VALUES (${clienteId}, ${tipo}, ${valor}, ${rotulo})
    RETURNING *
  `;

  return NextResponse.json(asset, { status: 201 });
}
